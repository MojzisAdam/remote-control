<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class DeviceUser extends Pivot
{
    use HasFactory;

    protected $table = 'device_user';

    protected $fillable = [
        'user_id',
        'device_id',
        'own_name',
        'favourite',
        'favouriteOrder',
        'notifications',
        'web_notifications',
    ];

    protected $casts = [
        'favourite' => 'boolean',
        'notifications' => 'boolean',
        'web_notifications' => 'boolean',
    ];
}