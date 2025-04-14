<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserGraphPreference extends Model
{
    use HasFactory;

    protected $table = 'user_graph_preferences';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'device_id',
        'hidden_lines'
    ];

    protected $casts = [
        'hidden_lines' => 'array'
    ];
}