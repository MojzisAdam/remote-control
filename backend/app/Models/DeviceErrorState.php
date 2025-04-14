<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeviceErrorState extends Model
{
    protected $primaryKey = 'device_id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['device_id', 'current_error_code'];
}