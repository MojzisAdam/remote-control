<?php

namespace App\Services\DeviceHistory;

use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DeviceHistoryResourceFactory
{
    /**
     * Create a data transformation resource collection
     */
    public static function makeDataTransformation(DeviceHistoryHandlerInterface $handler, $data): AnonymousResourceCollection
    {
        $resourceClass = $handler->getDataTransformationResource();
        return $resourceClass::collection($data);
    }

    /**
     * Create a dynamic data transformation resource collection
     */
    public static function makeDynamicDataTransformation(DeviceHistoryHandlerInterface $handler, $data): AnonymousResourceCollection
    {
        $resourceClass = $handler->getDynamicDataTransformationResource();
        return $resourceClass::collection($data);
    }

    /**
     * Create a history table resource collection
     */
    public static function makeHistoryTable(DeviceHistoryHandlerInterface $handler, $data): AnonymousResourceCollection
    {
        $resourceClass = $handler->getHistoryTableResource();
        return $resourceClass::collection($data);
    }
}
