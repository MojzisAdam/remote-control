<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeviceHistory extends Model
{
    use HasFactory;

    protected $table = 'device_history';
    protected $primaryKey = ['device_id', 'cas'];
    public $incrementing = false;
    public $timestamps = false; 

    protected $fillable = [
        'device_id', 'cas', 'TS1', 'TS2', 'TS3', 'TS4', 'TS5', 'TS6', 'TS7', 'TS8', 'TS9',
        'PTO', 'PTUV', 'PTO2', 'komp', 'kvyk', 'run', 'reg', 'vjedn', 'dzto', 'dztuv', 'tstat',
        'hdo', 'obd', 'chyba', 'PT', 'PPT', 'RPT', 'Prtk', 'TpnVk'
    ];
}
