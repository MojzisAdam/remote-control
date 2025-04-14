<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeviceNotification extends Model
{
    protected $fillable = ['device_id', 'error_code', 'message', 'message_key', 'message_data', 'notification_type_id'];

    public function notificationType()
    {
        return $this->belongsTo(NotificationType::class, 'notification_type_id');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'notification_user', 'notification_id', 'user_id')
            ->withPivot('seen')
            ->withTimestamps();
    }
}