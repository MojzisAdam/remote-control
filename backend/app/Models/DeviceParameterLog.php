<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeviceParameterLog extends Model
{
    protected $table = 'device_parameter_logs';

    protected $fillable = [
        'device_id',
        'user_id',
        'email',
        'parameter',
        'old_value',
        'new_value',
        'changed_at',
    ];

    protected $dates = ['changed_at'];
}