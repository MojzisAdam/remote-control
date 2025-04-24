<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Device extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'password',
        'ip',
        'display_type',
        'script_version',
        'fw_version',
        'last_activity',
        'send_data',
        'send_data_until',
        'error_code',
    ];

    protected $casts = [
        'send_data' => 'boolean',
        'last_activity' => 'datetime',
        'send_data_until' => 'datetime',
    ];

    public function data()
    {
        return $this->hasOne(DeviceData::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'device_user')
            ->withPivot(['own_name', 'favourite', 'notifications', 'web_notifications', 'favouriteOrder'])
            ->withTimestamps();
    }

    protected static function boot()
    {
        parent::boot();

        static::created(function ($device) {
            $device->description()->create([
                'device_id' => $device->id,
            ]);
        });
    }

    public function description()
    {
        return $this->hasOne(DeviceDescription::class);
    }
}