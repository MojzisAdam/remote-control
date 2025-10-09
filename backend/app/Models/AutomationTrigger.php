<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutomationTrigger extends Model
{
    use HasFactory;

    protected $fillable = [
        'automation_id',
        'type',
        'time_at',
        'days_of_week',
        'interval_seconds',
        'mqtt_topic',
        'mqtt_payload',
        'device_id',
        'field',
        'operator',
        'value',
    ];

    protected $casts = [
        'time_at' => 'datetime:H:i',
        'mqtt_payload' => 'array',
        'days_of_week' => 'array',
    ];

    // Constants for trigger types
    const TYPE_TIME = 'time';
    const TYPE_INTERVAL = 'interval';
    const TYPE_STATE_CHANGE = 'state_change';

    /**
     * Get the automation that owns the trigger
     */
    public function automation(): BelongsTo
    {
        return $this->belongsTo(Automation::class);
    }

    /**
     * Get the device for state change triggers
     */
    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    /**
     * Scope a query to only include time-based triggers
     */
    public function scopeTime($query)
    {
        return $query->where('type', self::TYPE_TIME);
    }

    /**
     * Scope a query to only include interval triggers
     */
    public function scopeInterval($query)
    {
        return $query->where('type', self::TYPE_INTERVAL);
    }

    /**
     * Scope a query to only include state change triggers
     */
    public function scopeStateChange($query)
    {
        return $query->where('type', self::TYPE_STATE_CHANGE);
    }

    /**
     * Check if this is a time-based trigger
     */
    public function isTimeBasedTrigger(): bool
    {
        return $this->type === self::TYPE_TIME;
    }

    /**
     * Check if this is an interval trigger
     */
    public function isIntervalTrigger(): bool
    {
        return $this->type === self::TYPE_INTERVAL;
    }

    /**
     * Check if this is a state change trigger
     */
    public function isStateChangeTrigger(): bool
    {
        return $this->type === self::TYPE_STATE_CHANGE;
    }
}