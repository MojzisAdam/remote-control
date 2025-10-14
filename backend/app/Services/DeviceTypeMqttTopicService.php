<?php

namespace App\Services;

use App\Models\Device;
use App\Models\DeviceType;
use Illuminate\Support\Collection;

class DeviceTypeMqttTopicService
{
    /**
     * Get automation subscribe topics for all device types
     */
    public function getAutomationSubscribeTopics(): Collection
    {
        return DeviceType::whereNotNull('mqtt_topics')
            ->get()
            ->map(function (DeviceType $deviceType) {
                $subscribeTopic = $deviceType->getAutomationSubscribeTopic();
                if ($subscribeTopic) {
                    return [
                        'device_type_id' => $deviceType->id,
                        'device_type_name' => $deviceType->name,
                        'topic' => $subscribeTopic,
                    ];
                }
                return null;
            })
            ->filter()
            ->values();
    }

    /**
     * Get automation subscribe topics for a specific device type
     */
    public function getAutomationSubscribeTopicsForDeviceType(string $deviceTypeId): ?array
    {
        $deviceType = DeviceType::find($deviceTypeId);
        if (!$deviceType || !$deviceType->hasAutomationMqttConfig()) {
            return null;
        }

        return [
            'device_type_id' => $deviceType->id,
            'device_type_name' => $deviceType->name,
            'topic' => $deviceType->getAutomationSubscribeTopic(),
            'command_topic_pattern' => $deviceType->getAutomationCommandTopic(),
        ];
    }

    /**
     * Get automation command topic for a specific device
     */
    public function getAutomationCommandTopicForDevice(string $deviceId): ?string
    {
        $device = Device::find($deviceId);
        if (!$device || !$device->deviceType) {
            return null;
        }

        return $device->deviceType->getAutomationCommandTopicForDevice($deviceId);
    }

    /**
     * Get all devices with their automation topics for a specific device type
     */
    public function getDevicesWithAutomationTopicsForDeviceType(string $deviceTypeId): Collection
    {
        $deviceType = DeviceType::find($deviceTypeId);
        if (!$deviceType || !$deviceType->hasAutomationMqttConfig()) {
            return collect();
        }

        return $deviceType->devices()->get()->map(function (Device $device) use ($deviceType) {
            return [
                'device_id' => $device->id,
                'device_name' => $device->name,
                'subscribe_topic' => $deviceType->getAutomationSubscribeTopicForDevice($device->id),
                'command_topic' => $deviceType->getAutomationCommandTopicForDevice($device->id),
            ];
        });
    }


    /**
     * Get all device types that support automation MQTT
     */
    public function getAutomationEnabledDeviceTypes(): Collection
    {
        return DeviceType::whereNotNull('mqtt_topics')
            ->get()
            ->filter(function (DeviceType $deviceType) {
                return $deviceType->hasAutomationMqttConfig();
            })
            ->values();
    }
}