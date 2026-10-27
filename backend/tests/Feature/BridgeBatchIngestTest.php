<?php

namespace Tests\Feature;

use App\Models\Device;
use App\Models\DeviceHistory;
use App\Models\DeviceNotification;
use Database\Seeders\NotificationTypesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class BridgeBatchIngestTest extends TestCase
{
    use RefreshDatabase;

    private const KEY = 'bridge-test-key';

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'app.api_valid_tokens.device' => self::KEY,
            'app.api_valid_tokens.history' => self::KEY,
            'app.api_valid_tokens.notify' => self::KEY,
        ]);

        $this->seed(NotificationTypesSeeder::class);
    }

    private function bridgePost(string $uri, array $body)
    {
        return $this->postJson($uri, $body, ['X-Api-Key' => self::KEY]);
    }

    private function makeDevice(string $id = 'cim-1', array $attributes = []): Device
    {
        return Device::create(array_merge([
            'id' => $id,
            'display_type' => '1',
            'last_activity' => now()->subHour(),
        ], $attributes));
    }

    private function historyRow(int $ref, string $cas, array $overrides = []): array
    {
        return array_merge([
            'ref' => $ref,
            'device_id' => 'cim-1',
            'cas' => $cas,
            'TS1' => 21.5, 'TS2' => 40.1, 'TS3' => 10, 'TS4' => 45, 'TS5' => 5,
            'PTUV' => 48, 'kvyk' => 3.2,
            'komp' => 1, 'run' => 1, 'reg' => 0, 'vjedn' => 1, 'dzto' => 0, 'dztuv' => 0,
            'tstat' => 0, 'hdo' => 1, 'obd' => 0, 'chyba' => 0,
        ], $overrides);
    }

    public function test_history_batch_keeps_every_row_of_one_device(): void
    {
        $this->makeDevice();
        $base = Carbon::parse('2026-10-26T10:00:00Z');

        $rows = [];
        foreach (range(1, 5) as $i) {
            $rows[] = $this->historyRow($i, $base->copy()->addMinutes($i)->toIso8601String());
        }

        $this->bridgePost('/api/device-history/batch', ['rows' => $rows])
            ->assertOk()
            ->assertJson(['accepted' => [1, 2, 3, 4, 5], 'rejected' => [], 'deferred' => []]);

        $this->assertSame(5, DeviceHistory::where('device_id', 'cim-1')->count());
    }

    public function test_history_batch_converts_cas_to_app_timezone(): void
    {
        config(['app.timezone' => 'Europe/Prague']);
        $this->makeDevice();

        $this->bridgePost('/api/device-history/batch', ['rows' => [$this->historyRow(1, '2026-07-01T10:00:00Z')]])
            ->assertOk();

        // UTC+2 in summer
        $this->assertDatabaseHas('device_history', ['device_id' => 'cim-1', 'cas' => '2026-07-01 12:00:00']);
    }

    public function test_history_batch_keeps_column_defaults_for_omitted_fields(): void
    {
        $this->makeDevice();

        $this->bridgePost('/api/device-history/batch', ['rows' => [
            $this->historyRow(1, '2026-10-26T10:00:00Z'),
            $this->historyRow(2, '2026-10-26T10:01:00Z', ['TS6' => 30.5]),
        ]])->assertOk()->assertJsonPath('accepted', [1, 2]);

        $rows = DeviceHistory::where('device_id', 'cim-1')->orderBy('cas')->get();
        $this->assertEquals(-128, $rows[0]->TS6);
        $this->assertEquals(30.5, $rows[1]->TS6);
    }

    public function test_history_batch_partially_accepts_and_defers_unknown_devices(): void
    {
        $this->makeDevice();

        $response = $this->bridgePost('/api/device-history/batch', ['rows' => [
            $this->historyRow(10, '2026-10-26T10:00:00Z'),
            $this->historyRow(11, '2026-10-26T10:01:00Z', ['TS1' => 'not-a-number']),
            $this->historyRow(12, '2026-10-26T10:02:00Z', ['device_id' => 'unknown']),
            $this->historyRow(13, now()->addHour()->toIso8601String()),
        ]]);

        $response->assertOk()
            ->assertJsonPath('accepted', [10])
            ->assertJsonPath('rejected.0.ref', 11)
            ->assertJsonPath('rejected.1.ref', 13)
            ->assertJsonPath('deferred.0.ref', 12);

        $this->assertSame(1, DeviceHistory::count());
    }

    public function test_history_batch_is_idempotent_on_retry(): void
    {
        $this->makeDevice();
        $body = ['rows' => [
            $this->historyRow(1, '2026-10-26T10:00:00Z'),
            $this->historyRow(2, '2026-10-26T10:03:00Z'),
        ]];

        $this->bridgePost('/api/device-history/batch', $body)->assertOk();
        $this->bridgePost('/api/device-history/batch', $body)->assertOk()->assertJsonPath('accepted', [1, 2]);

        $this->assertSame(2, DeviceHistory::count());
    }

    public function test_history_batch_rejects_bad_envelope(): void
    {
        $this->bridgePost('/api/device-history/batch', ['rows' => [['device_id' => 'cim-1']]])
            ->assertStatus(422);
    }

    public function test_batch_endpoints_require_api_key(): void
    {
        $this->postJson('/api/device-history/batch', ['rows' => []], ['X-Api-Key' => 'wrong'])
            ->assertStatus(403);
    }

    public function test_state_batch_creates_device(): void
    {
        $this->bridgePost('/api/devices/batch', ['items' => [[
            'ref' => 1, 'id' => 'new-1', 'password' => 'secret', 'display_type' => '1',
            'fw_v' => '2.0', 'received_at' => '2026-10-26T10:00:00Z',
        ]]])->assertOk()->assertJsonPath('accepted', [1]);

        $device = Device::find('new-1');
        $this->assertNotNull($device);
        $this->assertSame('2.0', $device->fw_version);
        $this->assertTrue($device->last_activity->equalTo(Carbon::parse('2026-10-26T10:00:00Z')));
    }

    public function test_state_batch_leaves_error_code_and_omitted_fields_alone(): void
    {
        $this->makeDevice('cim-1', ['error_code' => 5, 'fw_version' => '1.4', 'ip' => '10.0.0.5']);

        $this->bridgePost('/api/devices/batch', ['items' => [[
            'ref' => 1, 'id' => 'cim-1', 'password' => null, 'display_type' => '1',
            'error_code' => 0, 'received_at' => now()->toIso8601String(),
        ]]])->assertOk()->assertJsonPath('accepted', [1]);

        $device = Device::find('cim-1');
        $this->assertSame(5, (int) $device->error_code);
        $this->assertSame('1.4', $device->fw_version);
        $this->assertSame('10.0.0.5', $device->ip);
        $this->assertSame(0, DeviceNotification::count());
    }

    public function test_state_batch_does_not_move_last_activity_backwards(): void
    {
        $newer = now()->subMinute();
        $this->makeDevice('cim-1', ['last_activity' => $newer, 'fw_version' => '1.4']);

        $this->bridgePost('/api/devices/batch', ['items' => [[
            'ref' => 1, 'id' => 'cim-1', 'display_type' => '1', 'fw_v' => '1.0',
            'received_at' => $newer->copy()->subMinutes(5)->toIso8601String(),
        ]]])->assertOk()->assertJsonPath('accepted', [1]);

        $device = Device::find('cim-1');
        $this->assertSame($newer->timestamp, $device->last_activity->timestamp);
        $this->assertSame('1.4', $device->fw_version);
    }

    public function test_error_batch_notifies_only_on_change_and_defers_unknown_devices(): void
    {
        $this->makeDevice();

        $this->bridgePost('/api/device/notify/batch', ['items' => [
            ['ref' => 1, 'device_id' => 'cim-1', 'error_code' => 7],
            ['ref' => 2, 'device_id' => 'cim-1', 'error_code' => 7],
            ['ref' => 3, 'device_id' => 'ghost', 'error_code' => 7],
        ]])->assertOk()
            ->assertJsonPath('accepted', [1, 2])
            ->assertJsonPath('deferred.0.ref', 3);

        $this->assertSame(7, (int) Device::find('cim-1')->error_code);
        $this->assertSame(1, DeviceNotification::where('device_id', 'cim-1')->count());

        $this->bridgePost('/api/device/notify/batch', ['items' => [
            ['ref' => 4, 'device_id' => 'cim-1', 'error_code' => 0],
        ]])->assertOk()->assertJsonPath('accepted', [4]);

        $this->assertSame(0, (int) Device::find('cim-1')->error_code);
        $this->assertSame(2, DeviceNotification::where('device_id', 'cim-1')->count());
    }
}
