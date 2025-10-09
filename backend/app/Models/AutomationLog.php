<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutomationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'automation_id',
        'executed_at',
        'status',
        'details',
    ];

    protected $casts = [
        'executed_at' => 'datetime',
    ];

    // Constants for status
    const STATUS_SUCCESS = 'success';
    const STATUS_FAILED = 'failed';
    const STATUS_SKIPPED = 'skipped';
    const STATUS_PARTIAL = 'partial';
    const STATUS_WARNING = 'warning';

    /**
     * Get the automation that owns the log
     */
    public function automation(): BelongsTo
    {
        return $this->belongsTo(Automation::class);
    }

    /**
     * Scope a query to only include successful logs
     */
    public function scopeSuccessful($query)
    {
        return $query->where('status', self::STATUS_SUCCESS);
    }

    /**
     * Scope a query to only include failed logs
     */
    public function scopeFailed($query)
    {
        return $query->where('status', self::STATUS_FAILED);
    }

    /**
     * Scope a query to only include skipped logs
     */
    public function scopeSkipped($query)
    {
        return $query->where('status', self::STATUS_SKIPPED);
    }

    /**
     * Scope a query to only include partial logs
     */
    public function scopePartial($query)
    {
        return $query->where('status', self::STATUS_PARTIAL);
    }

    /**
     * Scope a query to only include warning logs
     */
    public function scopeWarning($query)
    {
        return $query->where('status', self::STATUS_WARNING);
    }

    /**
     * Scope a query to order by execution time (newest first)
     */
    public function scopeRecent($query)
    {
        return $query->orderBy('executed_at', 'desc');
    }

    /**
     * Check if this log represents a successful execution
     */
    public function isSuccessful(): bool
    {
        return $this->status === self::STATUS_SUCCESS;
    }

    /**
     * Check if this log represents a failed execution
     */
    public function isFailed(): bool
    {
        return $this->status === self::STATUS_FAILED;
    }

    /**
     * Check if this log represents a skipped execution
     */
    public function isSkipped(): bool
    {
        return $this->status === self::STATUS_SKIPPED;
    }

    /**
     * Check if this log represents a partial execution
     */
    public function isPartial(): bool
    {
        return $this->status === self::STATUS_PARTIAL;
    }

    /**
     * Check if this log represents a warning
     */
    public function isWarning(): bool
    {
        return $this->status === self::STATUS_WARNING;
    }

    /**
     * Check if this log represents a problematic status (failed or warning)
     */
    public function isProblematic(): bool
    {
        return in_array($this->status, [self::STATUS_FAILED, self::STATUS_WARNING]);
    }

    /**
     * Check if this log represents a non-execution (skipped)
     */
    public function wasNotExecuted(): bool
    {
        return $this->status === self::STATUS_SKIPPED;
    }

    /**
     * Create a success log
     */
    public static function logSuccess(int $automationId, string $details = null): self
    {
        return self::create([
            'automation_id' => $automationId,
            'executed_at' => now(),
            'status' => self::STATUS_SUCCESS,
            'details' => $details,
        ]);
    }

    /**
     * Create a failure log
     */
    public static function logFailure(int $automationId, string $details = null): self
    {
        return self::create([
            'automation_id' => $automationId,
            'executed_at' => now(),
            'status' => self::STATUS_FAILED,
            'details' => $details,
        ]);
    }

    /**
     * Create a skipped log
     */
    public static function logSkipped(int $automationId, string $details = null): self
    {
        return self::create([
            'automation_id' => $automationId,
            'executed_at' => now(),
            'status' => self::STATUS_SKIPPED,
            'details' => $details,
        ]);
    }

    /**
     * Create a partial execution log
     */
    public static function logPartial(int $automationId, string $details = null): self
    {
        return self::create([
            'automation_id' => $automationId,
            'executed_at' => now(),
            'status' => self::STATUS_PARTIAL,
            'details' => $details,
        ]);
    }

    /**
     * Create a warning log
     */
    public static function logWarning(int $automationId, string $details = null): self
    {
        return self::create([
            'automation_id' => $automationId,
            'executed_at' => now(),
            'status' => self::STATUS_WARNING,
            'details' => $details,
        ]);
    }

    /**
     * Get available statuses
     */
    public static function getAvailableStatuses(): array
    {
        return [
            self::STATUS_SUCCESS,
            self::STATUS_FAILED,
            self::STATUS_SKIPPED,
            self::STATUS_PARTIAL,
            self::STATUS_WARNING,
        ];
    }

    /**
     * Get status description
     */
    public function getStatusDescription(): string
    {
        return match ($this->status) {
            self::STATUS_SUCCESS => 'Automation executed successfully',
            self::STATUS_FAILED => 'Automation execution failed',
            self::STATUS_SKIPPED => 'Automation was skipped due to conditions not being met',
            self::STATUS_PARTIAL => 'Automation partially executed - some actions completed',
            self::STATUS_WARNING => 'Automation executed with warnings',
            default => 'Unknown status'
        };
    }

    /**
     * Get status color class for UI
     */
    public function getStatusColorClass(): string
    {
        return match ($this->status) {
            self::STATUS_SUCCESS => 'success',
            self::STATUS_FAILED => 'destructive',
            self::STATUS_SKIPPED => 'secondary',
            self::STATUS_PARTIAL => 'warning',
            self::STATUS_WARNING => 'warning',
            default => 'secondary'
        };
    }
}
