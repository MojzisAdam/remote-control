<?php

namespace App\Services\DeviceHistory;

use App\Models\Device;
use InvalidArgumentException;

class DeviceHistoryHandlerFactory
{
    /**
     * Create a device history handler based on device display type
     */
    public static function make(Device $device): DeviceHistoryHandlerInterface
    {
        return match ($device->display_type) {
            '3' => new DaitsuDeviceHistoryHandler(),
            '1', '2' => new StandardDeviceHistoryHandler(),
            default => throw new InvalidArgumentException("Unsupported device display type: {$device->display_type}")
        };
    }

    /**
     * Create a device history handler based on device display type string
     */
    public static function makeFromType(string $deviceDisplayType): DeviceHistoryHandlerInterface
    {
        return match ($deviceDisplayType) {
            '3' => new DaitsuDeviceHistoryHandler(),
            '1', '2' => new StandardDeviceHistoryHandler(),
            default => throw new InvalidArgumentException("Unsupported device display type: {$deviceDisplayType}")
        };
    }
}