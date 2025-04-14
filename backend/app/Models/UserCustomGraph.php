<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserCustomGraph extends Model
{
    use HasFactory;

    protected $table = 'user_custom_graphs';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'device_id',
        'graph_name',
        'selected_metrics',
        'from_date',
        'to_date'
    ];

    protected $casts = [
        'selected_metrics' => 'array',
        'from_date' => 'datetime',
        'to_date' => 'datetime'
    ];
}