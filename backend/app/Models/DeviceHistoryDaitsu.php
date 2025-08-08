<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeviceHistoryDaitsu extends Model
{
    use HasFactory;

    protected $table = 'device_history_daitsu';
    protected $primaryKey = ['device_id', 'cas'];
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'device_id',
        'cas',
        'reg_2',
        'reg_4',
        'reg_100',
        'reg_101',
        'reg_104',
        'reg_105',
        'reg_106',
        'reg_107',
        'reg_108',
        'reg_109',
        'reg_110',
        'reg_111',
        'reg_112',
        'reg_113',
        'reg_115',
        'reg_124',
        'reg_128_1',
        'reg_128_4',
        'reg_128_6',
        'reg_129_0',
        'reg_129_2',
        'reg_129_13',
        'reg_129_14',
        'reg_136',
        'reg_137',
        'reg_138',
        'reg_140'
    ];
}