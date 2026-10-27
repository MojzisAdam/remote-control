<?php

namespace App\Services\BridgeIngest;

use App\Models\Device;
use App\Models\DeviceType;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

/**
 * Applies batched device state (heartbeat, versions, IP, password).
 *
 * Unlike the single-row POST /devices, this never touches error_code: the bridge routes every
 * error-code change through the immediate error lane, so a delayed state row cannot undo a newer
 * error or send a false "resolved" notification.
 */
class DeviceStateBatchIngestor
{
    // request field => devices column; only written when the bridge sends a non-null value
    private const OPTIONAL_FIELDS = [
        'device_type_id' => 'device_type_id',
        'ip' => 'ip',
        'script_v' => 'script_version',
        'fw_v' => 'fw_version',
    ];

    public function ingest(array $items): BatchResult
    {
        $result = new BatchResult();

        $rules = [
            'id' => 'required|string|max:255',
            'password' => 'nullable|string',
            'display_type' => 'required|string',
            'device_type_id' => ['nullable', 'string', Rule::in(DeviceType::pluck('id')->all())],
            'ip' => 'nullable|ip',
            'script_v' => 'nullable|string',
            'fw_v' => 'nullable|string',
            'received_at' => 'required|date|before_or_equal:' . now()->addMinutes(5)->toIso8601String(),
        ];

        foreach ($items as $item) {
            $validator = Validator::make($item, $rules);

            if ($validator->fails()) {
                $result->reject($item['ref'], $validator->errors()->toArray());
                continue;
            }

            DB::transaction(fn () => $this->apply($validator->validated()));
            $result->accept($item['ref']);
        }

        return $result;
    }

    private function apply(array $state): void
    {
        $receivedAt = Carbon::parse($state['received_at'])->setTimezone(config('app.timezone'));

        $attributes = ['display_type' => $state['display_type']];
        foreach (self::OPTIONAL_FIELDS as $field => $column) {
            if (isset($state[$field])) {
                $attributes[$column] = $state[$field];
            }
        }

        $device = Device::lockForUpdate()->find($state['id']);

        if (!$device) {
            $attributes['id'] = $state['id'];
            $attributes['last_activity'] = $receivedAt;
            if (!empty($state['password'])) {
                $attributes['password'] = Hash::make($state['password'], ['rounds' => 8]);
            }
            Device::create($attributes);
            return;
        }

        // A retried or reordered batch must not move the device back in time.
        if ($device->last_activity && $receivedAt->lte($device->last_activity)) {
            return;
        }

        $device->fill($attributes);
        $device->last_activity = $receivedAt;

        if (!empty($state['password']) && !$this->passwordMatches($state['password'], $device->password)) {
            $device->password = Hash::make($state['password'], ['rounds' => 8]);
        }

        $device->save();
    }

    private function passwordMatches(string $plain, ?string $hash): bool
    {
        if (!$hash) {
            return false;
        }

        try {
            return Hash::check($plain, $hash);
        } catch (\Exception $e) {
            // Stored value is not a bcrypt hash (legacy rows)
            return false;
        }
    }
}
