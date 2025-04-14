<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class DeviceDescription extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id',
        'name',
        'owner',
        'zip_code',
        'city',
        'address',
        'description',
        'outdoor_unit_type',
        'installation_date',
    ];

    protected $casts = [
        'installation_date' => 'datetime',
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}