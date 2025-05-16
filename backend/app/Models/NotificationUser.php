<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class NotificationUser extends Pivot
{
    use HasFactory;

    protected $table = 'notification_user';

    protected $fillable = [
        'user_id',
        'notification_id',
        'seen',
    ];

    protected $casts = [
        'seen' => 'boolean',
    ];
}
