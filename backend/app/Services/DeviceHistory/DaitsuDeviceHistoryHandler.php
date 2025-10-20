<?php

namespace App\Services\DeviceHistory;

use App\Models\DeviceHistoryDaitsu;
use App\Http\Resources\DataTransformationResourceDaitsu;
use App\Http\Resources\DynamicDataTransformationResourceDaitsu;
use App\Http\Resources\HistoryTableResourceDaitsu;
use App\Rules\MySqlFloat;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class DaitsuDeviceHistoryHandler implements DeviceHistoryHandlerInterface
{
    public function getQuery(string $deviceId): Builder
    {
        return DeviceHistoryDaitsu::query()->where('device_id', $deviceId);
    }

    public function applyDateRange(Builder $query, Request $request): Builder
    {
        $fromDate = $request->from_date ?? now()->subDay()->toDateTimeString();
        $toDate = $request->to_date ?? now()->toDateTimeString();

        if ($request->has('from_date') && $request->has('to_date')) {
            return $query->whereBetween('cas', [$request->from_date, $request->to_date]);
        } else {
            return $query->whereBetween('cas', [$fromDate, $toDate]);
        }
    }

    public function applyErrorFilter(Builder $query, bool $errorOnly): Builder
    {
        if ($errorOnly) {
            return $query->where('reg_124', '>', 0);
        }
        return $query;
    }

    public function getDataTransformationResource(): string
    {
        return DataTransformationResourceDaitsu::class;
    }

    public function getDynamicDataTransformationResource(): string
    {
        return DynamicDataTransformationResourceDaitsu::class;
    }

    public function getHistoryTableResource(): string
    {
        return HistoryTableResourceDaitsu::class;
    }

    public function getErrorColumn(): string
    {
        return 'reg_124';
    }

    public function getAvailableColumns(): array
    {
        return [
            'device_id',
            'cas',
            'reg_2',
            'reg_4',
            'reg_100',
            'reg_101',
            'reg_104',
            'reg_105',
            'reg_106',
            'reg_107',
            'reg_108',
            'reg_109',
            'reg_110',
            'reg_111',
            'reg_112',
            'reg_113',
            'reg_115',
            'reg_124',
            'reg_128_1',
            'reg_128_4',
            'reg_128_6',
            'reg_129_0',
            'reg_129_2',
            'reg_129_13',
            'reg_129_14',
            'reg_136',
            'reg_137',
            'reg_138',
            'reg_140'
        ];
    }

    public function getInsertValidationRules(): array
    {
        return [
            'device_id' => 'required|string|exists:devices,id',
            'reg_2' => ['nullable', new MySqlFloat()],
            'reg_4' => ['nullable', new MySqlFloat()],
            'reg_100' => ['nullable', new MySqlFloat()],
            'reg_101' => ['nullable', new MySqlFloat()],
            'reg_104' => ['nullable', new MySqlFloat()],
            'reg_105' => ['nullable', new MySqlFloat()],
            'reg_106' => ['nullable', new MySqlFloat()],
            'reg_107' => ['nullable', new MySqlFloat()],
            'reg_108' => ['nullable', new MySqlFloat()],
            'reg_109' => ['nullable', new MySqlFloat()],
            'reg_110' => ['nullable', new MySqlFloat()],
            'reg_111' => ['nullable', new MySqlFloat()],
            'reg_112' => ['nullable', new MySqlFloat()],
            'reg_113' => ['nullable', new MySqlFloat()],
            'reg_115' => ['nullable', new MySqlFloat()],
            'reg_124' => ['nullable', new MySqlFloat()],
            'reg_128_1' => ['nullable', new MySqlFloat()],
            'reg_128_4' => ['nullable', new MySqlFloat()],
            'reg_128_6' => ['nullable', new MySqlFloat()],
            'reg_129_0' => ['nullable', new MySqlFloat()],
            'reg_129_2' => ['nullable', new MySqlFloat()],
            'reg_129_13' => ['nullable', new MySqlFloat()],
            'reg_129_14' => ['nullable', new MySqlFloat()],
            'reg_136' => ['nullable', new MySqlFloat()],
            'reg_137' => ['nullable', new MySqlFloat()],
            'reg_138' => ['nullable', new MySqlFloat()],
            'reg_140' => ['nullable', new MySqlFloat()],
        ];
    }

    public function insertHistory(array $validated): void
    {
        $validated['cas'] = Carbon::now();

        DeviceHistoryDaitsu::upsert(
            [$validated], // array of records to upsert
            ['device_id', 'cas'], // unique columns (composite key)
            array_keys($validated) // columns to update if duplicate exists
        );
    }

    public function getTemperatureColumns(): array
    {
        return ['reg_107', 'reg_110', 'reg_115'];
    }
}