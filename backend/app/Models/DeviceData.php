<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeviceData extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id',
        'TS1',
        'TS2',
        'TS3',
        'TS4',
        'TS5',
        'TS6',
        'TS7',
        'TS8',
        'PTO',
        'PTUV',
        'DZTO',
        'DZTUV',
        'rezim_reg',
        'stav_venk_jed',
        'stav_termostat',
        'stav_hdo',
        'stav_sezona',
        'stav_komp',
        'vykon_komp',
        'cislo_chyby',
        'TO_cislo_krivky',
        'TO_posun_krivky',
        'TO_manualni_tep',
        'TUV',
        'TUV_tep',
        'TUV_l_z',
        'l_z_funkce',
        'TO_68',
        'TO_75',
        'TO_76',
        'TO_77',
        'TO_78',
        'TUV_99',
        'TUV_108',
        'TUV_109',
        'TUV_110',
        'TUV_111',
        'DZ_128',
        'DZ_133',
        'RT_193',
        'RT_195',
        'reg_66',
        'reg_192',
        'reg_681',
        'reg_707',
        'reg_745',
        'reg_746',
        'reg_humidity',
        'fhi',
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}