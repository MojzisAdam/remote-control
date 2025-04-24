<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Laravel\Fortify\TwoFactorAuthenticatable;

use App\Notifications\ResetPassword as CustomResetPassword;
use App\Notifications\VerifyEmail as CustomVerifyEmail;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasRoles;
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'displayLastVisitedDevice',
        'lastVisitedDeviceId',
        'preferred_language'
    ];

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new CustomResetPassword($token));
    }

    public function sendEmailVerificationNotification()
    {
        $this->notify(new CustomVerifyEmail());
    }
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function setNameAttribute($value)
    {
        $this->attributes['name'] = "{$this->first_name} {$this->last_name}";
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            $user->name = "{$user->first_name} {$user->last_name}";
        });

        static::updating(function ($user) {
            $user->name = "{$user->first_name} {$user->last_name}";
        });
    }

    public function devices()
    {
        return $this->belongsToMany(Device::class, 'device_user')
            ->withPivot(['own_name', 'favourite', 'notifications', 'web_notifications', 'favouriteOrder'])
            ->withTimestamps();
    }

    public function notifications()
    {
        return $this->belongsToMany(DeviceNotification::class, 'notification_user', 'user_id', 'notification_id')
            ->withPivot('seen')
            ->withTimestamps();
    }

}