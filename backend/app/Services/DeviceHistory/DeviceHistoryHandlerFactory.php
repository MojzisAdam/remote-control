<?php

namespace App\Services\DeviceHistory;

use App\Models\Device;
use InvalidArgumentException;

class DeviceHistoryHandlerFactory
{
    /**
     * Create a device history handler based on device type
     */
    public static function make(Device $device): DeviceHistoryHandlerInterface
    {
        return match ($device->display_type) {
            '3' => new DaitsuDeviceHistoryHandler(),
            '1', '2' => new StandardDeviceHistoryHandler(),
            default => throw new InvalidArgumentException("Unsupported device type: {$device->display_type}")
        };
    }

    /**
     * Create a device history handler based on device type string
     */
    public static function makeFromType(string $deviceType): DeviceHistoryHandlerInterface
    {
        return match ($deviceType) {
            '3' => new DaitsuDeviceHistoryHandler(),
            '1', '2' => new StandardDeviceHistoryHandler(),
            default => throw new InvalidArgumentException("Unsupported device type: {$deviceType}")
        };
    }
}
