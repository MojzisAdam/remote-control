<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NotificationType extends Model
{
    // Notification type constants
    const ERROR_OCCURRED = 1;
    const ERROR_RESOLVED = 2;
    const AUTOMATION = 3;

    protected $fillable = ['name', 'description'];

    /**
     * Get all notifications of this type.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Get all device notifications of this type (through base notifications).
     */
    public function deviceNotifications()
    {
        return $this->hasMany(Notification::class)  // Get all notifications of this type
            ->whereHas('deviceNotification'); // But only those with device data
    }
}