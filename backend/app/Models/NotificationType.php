<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationType extends Model
{
    protected $fillable = ['name', 'description'];

    public function notifications()
    {
        return $this->hasMany(DeviceNotification::class);
    }
}