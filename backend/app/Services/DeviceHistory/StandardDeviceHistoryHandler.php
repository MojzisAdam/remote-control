<?php

namespace App\Services\DeviceHistory;

use App\Models\DeviceHistory;
use App\Http\Resources\DataTransformationResource;
use App\Http\Resources\DynamicDataTransformationResource;
use App\Http\Resources\HistoryTableResource;
use App\Rules\MySqlFloat;
use App\Rules\MySqlTinyInteger;
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
            'TS1' => ['required', new MySqlFloat()],
            'TS2' => ['required', new MySqlFloat()],
            'TS3' => ['required', new MySqlFloat()],
            'TS4' => ['required', new MySqlFloat()],
            'TS5' => ['required', new MySqlFloat()],
            'TS6' => ['nullable', new MySqlFloat()],
            'TS7' => ['nullable', new MySqlFloat()],
            'TS8' => ['nullable', new MySqlFloat()],
            'TS9' => ['nullable', new MySqlFloat()],
            'PTO' => ['nullable', new MySqlFloat()],
            'PTUV' => ['required', new MySqlFloat()],
            'PTO2' => ['nullable', new MySqlFloat()],
            'komp' => ['required', new MySqlTinyInteger()],
            'kvyk' => ['required', new MySqlFloat()],
            'run' => ['required', new MySqlTinyInteger()],
            'reg' => ['required', new MySqlTinyInteger()],
            'vjedn' => ['required', new MySqlTinyInteger()],
            'dzto' => ['required', new MySqlTinyInteger()],
            'dztuv' => ['required', new MySqlTinyInteger()],
            'tstat' => ['required', new MySqlTinyInteger()],
            'hdo' => ['required', new MySqlTinyInteger()],
            'obd' => ['required', new MySqlTinyInteger()],
            'chyba' => ['required', new MySqlTinyInteger()],
            'PT' => ['nullable', new MySqlFloat()],
            'PPT' => ['nullable', new MySqlFloat()],
            'RPT' => ['nullable', new MySqlFloat()],
            'Prtk' => ['nullable', new MySqlFloat()],
            'TpnVk' => ['nullable', new MySqlFloat()],
        ];
    }

    public function insertHistory(array $validated): void
    {
        $validated['cas'] = Carbon::now();

        DeviceHistory::upsert(
            [$validated], // array of records to upsert
            ['device_id', 'cas'], // unique columns (composite key)
            array_keys($validated) // columns to update if duplicate exists
        );
    }
}