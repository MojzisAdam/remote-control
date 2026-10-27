<?php

namespace App\Services\BridgeIngest;

use App\Models\Device;
use App\Services\DeviceHistory\DeviceHistoryHandlerFactory;
use Illuminate\Support\Facades\Validator;
use InvalidArgumentException;

class HistoryBatchIngestor
{
    public function ingest(array $rows): BatchResult
    {
        $result = new BatchResult();

        $deviceIds = array_unique(array_column($rows, 'device_id'));
        $devices = Device::whereIn('id', $deviceIds)->get(['id', 'display_type'])->keyBy('id');

        // display_type => ['handler' => ..., 'rules' => ..., 'rows' => [...], 'refs' => [...]]
        $groups = [];

        foreach ($rows as $row) {
            $ref = $row['ref'];
            $device = $devices->get($row['device_id']);

            if (!$device) {
                $result->defer($ref, 'Device not found.');
                continue;
            }

            $type = (string) $device->display_type;

            if (!isset($groups[$type])) {
                try {
                    $handler = DeviceHistoryHandlerFactory::makeFromType($type);
                } catch (InvalidArgumentException $e) {
                    $result->reject($ref, ['device_id' => [$e->getMessage()]]);
                    continue;
                }

                $groups[$type] = [
                    'handler' => $handler,
                    // Devices are already resolved above, so the per-row `exists` query is dropped.
                    'rules' => array_merge($handler->getInsertValidationRules(), [
                        'device_id' => 'required|string',
                        'cas' => 'required|date|before_or_equal:' . now()->addMinutes(5)->toIso8601String(),
                    ]),
                    'rows' => [],
                    'refs' => [],
                ];
            }

            $validator = Validator::make($row, $groups[$type]['rules']);

            if ($validator->fails()) {
                $result->reject($ref, $validator->errors()->toArray());
                continue;
            }

            $groups[$type]['rows'][] = $validator->validated();
            $groups[$type]['refs'][] = $ref;
        }

        // A DB failure here propagates as a 500 and the bridge retries the whole batch.
        // That is safe because rows are upserted on (device_id, cas).
        foreach ($groups as $group) {
            if ($group['rows']) {
                $group['handler']->insertHistoryBatch($group['rows']);
                $result->acceptMany($group['refs']);
            }
        }

        return $result;
    }
}
