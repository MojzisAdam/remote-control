<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeviceParameterChange extends Model
{
    protected $table = 'device_parameter_changes';

    protected $primaryKey = 'device_id';

    public $incrementing = false;

    protected $fillable = [
        'device_id',
        'TO_cislo_krivky',
        'zmena_TO_cislo_krivky',
        'TO_posun_krivky',
        'zmena_TO_posun_krivky',
        'TO_manualni_tep',
        'zmena_TO_manualni_tep',
        'TUV',
        'zmena_TUV',
        'TUV_tep',
        'zmena_TUV_tep',
        'TUV_l_z',
        'zmena_TUV_l_z',
        'l_z_funkce',
        'zmena_l_z_funkce',
        'TO_68',
        'zmena_TO_68',
        'TO_75',
        'zmena_TO_75',
        'TO_76',
        'zmena_TO_76',
        'TO_77',
        'zmena_TO_77',
        'TO_78',
        'zmena_TO_78',
        'TUV_99',
        'zmena_TUV_99',
        'TUV_108',
        'zmena_TUV_108',
        'TUV_109',
        'zmena_TUV_109',
        'TUV_110',
        'zmena_TUV_110',
        'TUV_111',
        'zmena_TUV_111',
        'DZ_128',
        'zmena_DZ_128',
        'DZ_133',
        'zmena_DZ_133',
        'RT_193',
        'zmena_RT_193',
        'RT_195',
        'zmena_RT_195',
        'history_interval',
        'zmena_history_interval',
    ];
}