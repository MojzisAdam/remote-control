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

        $knownIds = Device::whereIn('id', array_unique(array_column($items, 'device_id')))
            ->pluck('id')
            ->flip();

        foreach ($items as $item) {
            $validator = Validator::make($item, [
                'device_id' => 'required|string',
                'error_code' => 'required|integer',
            ]);

            if ($validator->fails()) {
                $result->reject($item['ref'], $validator->errors()->toArray());
                continue;
            }

            // The device may be registered by a state batch that has not arrived yet.
            if (!$knownIds->has($item['device_id'])) {
                $result->defer($item['ref'], 'Device not found.');
                continue;
            }

            $this->errorNotificationService->processErrorTransition($item['device_id'], $item['error_code']);
            $result->accept($item['ref']);
        }

        return $result;
    }
}
