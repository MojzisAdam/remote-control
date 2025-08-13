<?php

namespace App\Services\DeviceHistory;

use App\Models\DeviceHistoryDaitsu;
use App\Http\Resources\DataTransformationResourceDaitsu;
use App\Http\Resources\DynamicDataTransformationResourceDaitsu;
use App\Http\Resources\HistoryTableResourceDaitsu;
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
            'reg_2' => 'nullable|numeric',
            'reg_4' => 'nullable|numeric',
            'reg_100' => 'nullable|numeric',
            'reg_101' => 'nullable|numeric',
            'reg_104' => 'nullable|numeric',
            'reg_105' => 'nullable|numeric',
            'reg_106' => 'nullable|numeric',
            'reg_107' => 'nullable|numeric',
            'reg_108' => 'nullable|numeric',
            'reg_109' => 'nullable|numeric',
            'reg_110' => 'nullable|numeric',
            'reg_111' => 'nullable|numeric',
            'reg_112' => 'nullable|numeric',
            'reg_113' => 'nullable|numeric',
            'reg_115' => 'nullable|numeric',
            'reg_124' => 'nullable|numeric',
            'reg_128_1' => 'nullable|numeric',
            'reg_128_4' => 'nullable|numeric',
            'reg_128_6' => 'nullable|numeric',
            'reg_129_0' => 'nullable|numeric',
            'reg_129_2' => 'nullable|numeric',
            'reg_129_13' => 'nullable|numeric',
            'reg_129_14' => 'nullable|numeric',
            'reg_136' => 'nullable|numeric',
            'reg_137' => 'nullable|numeric',
            'reg_138' => 'nullable|numeric',
            'reg_140' => 'nullable|numeric',
        ];
    }

    public function insertHistory(array $validated): void
    {
        $validated['cas'] = Carbon::now();

        DeviceHistoryDaitsu::updateOrCreate(
            [
                'device_id' => $validated['device_id'],
                'cas' => $validated['cas'],
            ],
            $validated
        );
    }

    public function getTemperatureColumns(): array
    {
        return ['reg_107', 'reg_110', 'reg_115'];
    }
}
