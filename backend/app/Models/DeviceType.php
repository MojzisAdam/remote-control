<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DeviceType extends Model
{
    use HasFactory;

    protected $table = 'device_types';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'description',
        'capabilities', // JSON field
        'mqtt_topics', // JSON field
    ];

    protected $casts = [
        'capabilities' => 'array',
        'mqtt_topics' => 'array',
    ];

    public function devices()
    {
        return $this->hasMany(Device::class, 'device_type_id');
    }

    /**
     * Get the automation subscribe topic pattern for this device type
     */
    public function getAutomationSubscribeTopic(): ?string
    {
        return $this->mqtt_topics['automation']['subscribe'] ?? null;
    }

    /**
     * Get the automation command topic pattern for this device type
     */
    public function getAutomationCommandTopic(): ?string
    {
        return $this->mqtt_topics['automation']['command'] ?? null;
    }

    /**
     * Get the automation subscribe topic for a specific device
     */
    public function getAutomationSubscribeTopicForDevice(string $deviceId): ?string
    {
        $pattern = $this->getAutomationSubscribeTopic();
        return $pattern ? str_replace('{device_id}', $deviceId, $pattern) : null;
    }

    /**
     * Get the automation command topic for a specific device
     */
    public function getAutomationCommandTopicForDevice(string $deviceId): ?string
    {
        $pattern = $this->getAutomationCommandTopic();
        return $pattern ? str_replace('{device_id}', $deviceId, $pattern) : null;
    }

    /**
     * Check if this device type has automation MQTT configuration
     */
    public function hasAutomationMqttConfig(): bool
    {
        return isset($this->mqtt_topics['automation']) &&
            !empty($this->mqtt_topics['automation']['subscribe']) &&
            !empty($this->mqtt_topics['automation']['command']);
    }

    /**
     * Get all available MQTT topic patterns for this device type
     */
    public function getAllMqttTopics(): array
    {
        return $this->mqtt_topics ?? [];
    }
}