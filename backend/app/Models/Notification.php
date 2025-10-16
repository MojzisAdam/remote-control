<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Notification extends Model
{
    protected $fillable = [
        'title',
        'body',
        'notification_type_id'
    ];

    /**
     * Get the notification type that owns the notification.
     */
    public function notificationType(): BelongsTo
    {
        return $this->belongsTo(NotificationType::class);
    }

    /**
     * Get the users that belong to the notification.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'notification_user', 'notification_id', 'user_id')
            ->withPivot('seen')
            ->withTimestamps();
    }

    /**
     * Get the device notification associated with this notification (if it's a device notification).
     */
    public function deviceNotification(): HasOne
    {
        return $this->hasOne(DeviceNotification::class);
    }

    /**
     * Check if this is a device notification.
     */
    public function isDeviceNotification(): bool
    {
        return $this->deviceNotification()->exists();
    }

    /**
     * Get device information if this is a device notification.
     */
    public function device()
    {
        return $this->deviceNotification?->device();
    }
}