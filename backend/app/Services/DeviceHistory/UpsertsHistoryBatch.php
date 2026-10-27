<?php

namespace App\Services\DeviceHistory;

use Carbon\Carbon;

trait UpsertsHistoryBatch
{
    /**
     * Upsert validated rows that carry their own `cas` (ISO-8601, any offset).
     *
     * Rows are grouped by their column set, because a multi-row INSERT needs identical columns,
     * and filling absent columns with NULL would bypass column defaults (e.g. TS6-TS9 = -128).
     */
    protected function upsertHistoryBatch(string $modelClass, array $rows): void
    {
        $timezone = config('app.timezone');
        $byColumns = [];

        foreach ($rows as $row) {
            $row['cas'] = Carbon::parse($row['cas'])->setTimezone($timezone)->format('Y-m-d H:i:s');
            ksort($row);
            $byColumns[implode(',', array_keys($row))][] = $row;
        }

        foreach ($byColumns as $records) {
            $updateColumns = array_values(array_diff(array_keys($records[0]), ['device_id', 'cas']));

            foreach (array_chunk($records, 250) as $chunk) {
                $modelClass::upsert($chunk, ['device_id', 'cas'], $updateColumns);
            }
        }
    }
}
