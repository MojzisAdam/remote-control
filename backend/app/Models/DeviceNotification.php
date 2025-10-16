<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class DeviceNotification extends Model
{
    protected $fillable = [
        'device_id',
        'error_code',
        'message',
        'message_key',
        'message_data',
        'notification_id'
    ];

    /**
     * Get the base notification that this device notification belongs to.
     */
    public function notification(): BelongsTo
    {
        return $this->belongsTo(Notification::class);
    }

    /**
     * Get the notification type (through the base notification).
     */
    public function notificationType(): BelongsTo
    {
        return $this->notification?->notificationType() ?? $this->belongsTo(NotificationType::class)->whereRaw('0 = 1');
    }

    /**
     * Get the device associated with this notification.
     */
    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class, 'device_id', 'id');
    }

    /**
     * Get the users that belong to this notification (through the base notification).
     */
    public function users(): BelongsToMany
    {
        return $this->notification?->users() ?? collect();
    }

    /**
     * Helper method to get users directly if notification exists.
     */
    public function getUsersAttribute()
    {
        return $this->notification?->users;
    }
}