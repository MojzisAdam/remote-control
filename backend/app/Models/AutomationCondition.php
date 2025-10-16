<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutomationCondition extends Model
{
    use HasFactory;

    protected $fillable = [
        'automation_id',
        'type',
        'device_id',
        'field',
        'operator',
        'value',
        'time_at',
        'days_of_week',
    ];

    protected $casts = [
        'days_of_week' => 'array',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
    ];

    // Constants for condition types
    const TYPE_SIMPLE = 'simple';
    const TYPE_TIME = 'time';
    const TYPE_DAY_OF_WEEK = 'day_of_week';

    // Constants for operators
    const OPERATOR_LESS_THAN = '<';
    const OPERATOR_LESS_THAN_OR_EQUAL = '<=';
    const OPERATOR_EQUAL = '=';
    const OPERATOR_GREATER_THAN_OR_EQUAL = '>=';
    const OPERATOR_GREATER_THAN = '>';
    const OPERATOR_NOT_EQUAL = '!=';

    /**
     * Get the automation that owns the condition
     */
    public function automation(): BelongsTo
    {
        return $this->belongsTo(Automation::class);
    }

    /**
     * Get the device for the condition
     */
    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    /**
     * Evaluate the condition against a given value
     */
    public function evaluate($actualValue): bool
    {
        $expectedValue = $this->value;

        // Try to convert to numeric if both values are numeric
        if (is_numeric($actualValue) && is_numeric($expectedValue)) {
            $actualValue = (float) $actualValue;
            $expectedValue = (float) $expectedValue;
        }

        return match ($this->operator) {
            self::OPERATOR_LESS_THAN => $actualValue < $expectedValue,
            self::OPERATOR_LESS_THAN_OR_EQUAL => $actualValue <= $expectedValue,
            self::OPERATOR_EQUAL => $actualValue == $expectedValue,
            self::OPERATOR_GREATER_THAN_OR_EQUAL => $actualValue >= $expectedValue,
            self::OPERATOR_GREATER_THAN => $actualValue > $expectedValue,
            self::OPERATOR_NOT_EQUAL => $actualValue != $expectedValue,
            default => false,
        };
    }

    /**
     * Get human-readable operator
     */
    public function getOperatorTextAttribute(): string
    {
        return match ($this->operator) {
            self::OPERATOR_LESS_THAN => 'less than',
            self::OPERATOR_LESS_THAN_OR_EQUAL => 'less than or equal to',
            self::OPERATOR_EQUAL => 'equal to',
            self::OPERATOR_GREATER_THAN_OR_EQUAL => 'greater than or equal to',
            self::OPERATOR_GREATER_THAN => 'greater than',
            self::OPERATOR_NOT_EQUAL => 'not equal to',
            default => 'unknown',
        };
    }

    /**
     * Get available operators
     */
    public static function getAvailableOperators(): array
    {
        return [
            self::OPERATOR_LESS_THAN,
            self::OPERATOR_LESS_THAN_OR_EQUAL,
            self::OPERATOR_EQUAL,
            self::OPERATOR_GREATER_THAN_OR_EQUAL,
            self::OPERATOR_GREATER_THAN,
            self::OPERATOR_NOT_EQUAL,
        ];
    }

    /**
     * Scope a query to only include simple conditions
     */
    public function scopeSimple($query)
    {
        return $query->where('type', self::TYPE_SIMPLE);
    }

    /**
     * Scope a query to only include time conditions
     */
    public function scopeTime($query)
    {
        return $query->where('type', self::TYPE_TIME);
    }

    /**
     * Scope a query to only include day of week conditions
     */
    public function scopeDayOfWeek($query)
    {
        return $query->where('type', self::TYPE_DAY_OF_WEEK);
    }

    /**
     * Check if this is a simple condition
     */
    public function isSimpleCondition(): bool
    {
        return $this->type === self::TYPE_SIMPLE;
    }

    /**
     * Check if this is a time condition
     */
    public function isTimeCondition(): bool
    {
        return $this->type === self::TYPE_TIME;
    }

    /**
     * Check if this is a day of week condition
     */
    public function isDayOfWeekCondition(): bool
    {
        return $this->type === self::TYPE_DAY_OF_WEEK;
    }

    /**
     * Get available condition types
     */
    public static function getAvailableTypes(): array
    {
        return [
            self::TYPE_SIMPLE,
            self::TYPE_TIME,
            self::TYPE_DAY_OF_WEEK,
        ];
    }

    /**
     * Get the condition configuration as array
     */
    public function getConfigAttribute(): array
    {
        $config = [
            'type' => $this->type,
        ];

        switch ($this->type) {
            case self::TYPE_SIMPLE:
                $config['device_id'] = $this->device_id;
                $config['field'] = $this->field;
                $config['operator'] = $this->operator;
                $config['value'] = $this->value;
                break;
            case self::TYPE_TIME:
                $config['time_at'] = $this->time_at;
                break;
            case self::TYPE_DAY_OF_WEEK:
                $config['days_of_week'] = $this->days_of_week;
                break;
        }

        return $config;
    }
}