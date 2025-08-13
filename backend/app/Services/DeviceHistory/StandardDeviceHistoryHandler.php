<?php

namespace App\Services\DeviceHistory;

use App\Models\DeviceHistory;
use App\Http\Resources\DataTransformationResource;
use App\Http\Resources\DynamicDataTransformationResource;
use App\Http\Resources\HistoryTableResource;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class StandardDeviceHistoryHandler implements DeviceHistoryHandlerInterface
{
    public function getQuery(string $deviceId): Builder
    {
        return DeviceHistory::query()->where('device_id', $deviceId);
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
            return $query->where('chyba', '>', 0);
        }
        return $query;
    }

    public function getDataTransformationResource(): string
    {
        return DataTransformationResource::class;
    }

    public function getDynamicDataTransformationResource(): string
    {
        return DynamicDataTransformationResource::class;
    }

    public function getHistoryTableResource(): string
    {
        return HistoryTableResource::class;
    }

    public function getErrorColumn(): string
    {
        return 'chyba';
    }

    public function getAvailableColumns(): array
    {
        return [
            'device_id',
            'cas',
            'TS1',
            'TS2',
            'TS3',
            'TS4',
            'TS5',
            'TS6',
            'TS7',
            'TS8',
            'TS9',
            'PTO',
            'PTUV',
            'PTO2',
            'komp',
            'kvyk',
            'run',
            'reg',
            'vjedn',
            'dzto',
            'dztuv',
            'tstat',
            'hdo',
            'obd',
            'chyba',
            'PT',
            'PPT',
            'RPT',
            'Prtk',
            'TpnVk'
        ];
    }

    public function getTemperatureColumns(): array
    {
        return ['TS1', 'TS2', 'TS4'];
    }

    public function getInsertValidationRules(): array
    {
        return [
            'device_id' => 'required|string|exists:devices,id',
            'TS1' => 'required|numeric',
            'TS2' => 'required|numeric',
            'TS3' => 'required|numeric',
            'TS4' => 'required|numeric',
            'TS5' => 'required|numeric',
            'TS6' => 'numeric',
            'TS7' => 'numeric',
            'TS8' => 'numeric',
            'TS9' => 'numeric',
            'PTO' => 'numeric',
            'PTUV' => 'required|numeric',
            'PTO2' => 'numeric',
            'komp' => 'required|numeric',
            'kvyk' => 'required|numeric',
            'run' => 'required|numeric',
            'reg' => 'required|numeric',
            'vjedn' => 'required|numeric',
            'dzto' => 'required|numeric',
            'dztuv' => 'required|numeric',
            'tstat' => 'required|numeric',
            'hdo' => 'required|numeric',
            'obd' => 'required|numeric',
            'chyba' => 'required|numeric',
            'PT' => 'nullable|numeric',
            'PPT' => 'nullable|numeric',
            'RPT' => 'nullable|numeric',
            'Prtk' => 'nullable|numeric',
            'TpnVk' => 'nullable|numeric',
        ];
    }

    public function insertHistory(array $validated): void
    {
        $validated['cas'] = Carbon::now();

        DeviceHistory::updateOrCreate(
            [
                'device_id' => $validated['device_id'],
                'cas' => $validated['cas'],
            ],
            $validated
        );
    }
}
