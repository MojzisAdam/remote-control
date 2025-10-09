<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutomationAction extends Model
{
    use HasFactory;

    protected $fillable = [
        'automation_id',
        'type',
        'mqtt_topic',
        'mqtt_payload',
        'device_id',
        'field',
        'value',
        'notification_title',
        'notification_message',
    ];

    protected $casts = [
        'mqtt_payload' => 'array',
    ];

    // Constants for action types
    const TYPE_NOTIFY = 'notify';
    const TYPE_LOG = 'log';
    const TYPE_DEVICE_CONTROL = 'device_control';

    /**
     * Get the automation that owns the action
     */
    public function automation(): BelongsTo
    {
        return $this->belongsTo(Automation::class);
    }

    /**
     * Get the device for device control actions
     */
    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    /**
     * Scope a query to only include notification actions
     */
    public function scopeNotify($query)
    {
        return $query->where('type', self::TYPE_NOTIFY);
    }

    /**
     * Scope a query to only include logging actions
     */
    public function scopeLog($query)
    {
        return $query->where('type', self::TYPE_LOG);
    }

    /**
     * Scope a query to only include device control actions
     */
    public function scopeDeviceControl($query)
    {
        return $query->where('type', self::TYPE_DEVICE_CONTROL);
    }

    /**
     * Check if this is a notification action
     */
    public function isNotification(): bool
    {
        return $this->type === self::TYPE_NOTIFY;
    }

    /**
     * Check if this is a logging action
     */
    public function isLog(): bool
    {
        return $this->type === self::TYPE_LOG;
    }

    /**
     * Check if this is a device control action
     */
    public function isDeviceControl(): bool
    {
        return $this->type === self::TYPE_DEVICE_CONTROL;
    }

    /**
     * Get available action types
     */
    public static function getAvailableTypes(): array
    {
        return [
            self::TYPE_NOTIFY,
            self::TYPE_LOG,
            self::TYPE_DEVICE_CONTROL,
        ];
    }

    /**
     * Get the action configuration as array
     */
    public function getConfigAttribute(): array
    {
        $config = [
            'type' => $this->type,
        ];

        switch ($this->type) {
            case self::TYPE_NOTIFY:
                $config['title'] = $this->notification_title;
                $config['message'] = $this->notification_message;
                break;
            case self::TYPE_DEVICE_CONTROL:
                $config['device_id'] = $this->device_id;
                $config['field'] = $this->field;
                $config['value'] = $this->value;
                break;
            case self::TYPE_LOG:
                $config['message'] = $this->notification_message ?: 'Automation executed';
                break;
        }

        return $config;
    }
}