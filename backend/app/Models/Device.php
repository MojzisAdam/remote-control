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
        'device_type_id',
        'script_version',
        'fw_version',
        'last_activity',
        'send_data',
        'send_data_until',
        'error_code',
    ];

    /**
     * Get the device type for this device
     */
    public function type()
    {
        return $this->belongsTo(DeviceType::class, 'device_type_id');
    }

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

            if ($device->display_type != '3') {
                DeviceData::create([
                    'device_id' => $device->id,
                ]);
                DeviceParameterChange::create([
                    'device_id' => $device->id,
                ]);
            }
        });
    }

    public function description()
    {
        return $this->hasOne(DeviceDescription::class);
    }

    /**
     * Get automation triggers that reference this device
     */
    public function automationTriggers()
    {
        return $this->hasMany(AutomationTrigger::class);
    }

    /**
     * Get automation conditions that reference this device
     */
    public function automationConditions()
    {
        return $this->hasMany(AutomationCondition::class);
    }

    /**
     * Get automation actions that target this device
     */
    public function automationActions()
    {
        return $this->hasMany(AutomationAction::class);
    }
}