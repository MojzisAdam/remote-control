<?php

namespace App\Services\BridgeIngest;

use App\Models\Device;
use App\Services\ErrorNotificationService;
use Illuminate\Support\Facades\Validator;

class ErrorBatchIngestor
{
    public function __construct(private ErrorNotificationService $errorNotificationService)
    {
    }

    /**
     * Items are processed in the order sent, so per-device transitions keep their sequence.
     * Unchanged codes are a no-op in ErrorNotificationService, which makes retries safe.
     */
    public function ingest(array $items): BatchResult
    {
        $result = new BatchResult();

        // lowercased ID => stored ID; whereIn() matches case-insensitively (column collation), so the lookup must too
        $knownIds = Device::whereIn('id', array_unique(array_column($items, 'device_id')))
            ->pluck('id')
            ->keyBy(fn (string $id) => mb_strtolower($id));

        foreach ($items as $item) {
            $validator = Validator::make($item, [
                'device_id' => 'required|string',
                'error_code' => 'required|integer',
            ]);

            if ($validator->fails()) {
                $result->reject($item['ref'], $validator->errors()->toArray());
                continue;
            }

            $deviceId = $knownIds->get(mb_strtolower($item['device_id']));

            // The device may be registered by a state batch that has not arrived yet.
            if ($deviceId === null) {
                $result->defer($item['ref'], 'Device not found.');
                continue;
            }

            $this->errorNotificationService->processErrorTransition($deviceId, $item['error_code']);
            $result->accept($item['ref']);
        }

        return $result;
    }
}
