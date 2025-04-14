<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Device;
use App\Models\DeviceParameterChange;
use App\Models\DeviceHistory;
use App\Models\User;
use App\Models\DeviceUser;
use App\Models\DeviceData;
use App\Models\DeviceDescription;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use App\Services\ErrorNotificationService;

class RpiController extends Controller
{
    protected $errorNotificationService;
    public function __construct(ErrorNotificationService $errorNotificationService)
    {
        $this->errorNotificationService = $errorNotificationService;
        header('Content-type: text/html; charset=utf-8');
        mb_internal_encoding('UTF-8');
    }

    public function handleRequest(Request $request)
    {
        // Authentication and action routing
        if (($request->query('54GfsMa') == 's5d4EXTB516fsda') && ($request->query('dsfQ51D5dfs') == 'ds45fFDds516Gf5dDs16')) {
            $this->authenticateAction($request, 'getWriteStatus');
            return $this->getWriteStatus($request);
        } elseif (($request->query('bo2De') == 'fsD15V6F') && ($request->query('ob63PoLee') == '54dS6ANs6d5gf')) {
            $this->authenticateAction($request, 'updateCimData');
            return $this->updateCimData($request);
        } elseif (($request->query('sH7dbHckK7cbj') == 'dsHdj78dkjL89dcjkdJ8') && ($request->query('dibdjbHNDedljd89327') == 'ie8NIbvieJKiekjcw8')) {
            $this->authenticateAction($request, 'updateCimErrorData');
            return $this->updateCimErrorData($request);
        } elseif (($request->query('DFfgSf5s64') == '56Shg4DFG') && ($request->query('hj5DCF4cnncJ9H') == 'SFD4Hgfh89Sjhf4S4HGssS65')) {
            $this->authenticateAction($request, 'insertCimHistory');
            return $this->insertCimHistory($request);
        } elseif (($request->query('jkG5Bf6j') == 'fj5gd46Dhjg65Gfghj') && ($request->query('hgj54Ff6j4Qfgzh') == 'dh5G64hdsFhggsd65h')) {
            $this->authenticateAction($request, 'resetWriteMe');
            return $this->resetWriteMe($request);
        } elseif (($request->query('a5sE6R58fEsd') == 'fd54gh9FZd') && ($request->query('156EWew54j5') == 'fd894hFDG9t865s')) {
            $this->authenticateAction($request, 'getWebChanges');
            return $this->getWebChanges($request);
        } elseif (($request->query('69jSaG9e8g') == '5sdFG4fh8564sdfF5DFdsf6g') && ($request->query('9awS8h9GDdzt87') == 's4hGdf56FD1d987d')) {
            $this->authenticateAction($request, 'resetWebChange');
            return $this->resetWebChange($request);
        } elseif (($request->query('65FfdsGER4g') == '56sde5LJu6ilzCN4') && ($request->query('d6fg51VNavs598rt') == '654dfhVBMF465fStz')) {
            $this->authenticateAction($request, 'initializeCim');
            return $this->initializeCim($request);
        } elseif (($request->query('sGd456fsD56HBdf4') == 'sr645sSDdfg56F46') && ($request->query('sg459Fd5Gfj54t6Hfhsde') == '5cx4kjF4p5KBcnd5Dgf')) {
            $this->authenticateAction($request, 'getEmailsForErrors');
            return $this->getEmailsForErrors($request);
        } elseif (($request->query('p5PsED') == '15S6sdfSA') && ($request->query('5fDd8g56fHdb') == '2dDs5dFs5')) {
            $this->authenticateAction($request, 'updatePassword');
            return $this->updatePassword($request);
        } elseif (($request->query('dfgSG45DFGdfg') == 'dsGH5fg15H64sf1dgd') && ($request->query('gfSDF5d4gHFHfd546g') == '45Dj6GztGfg')) {
            $this->authenticateAction($request, 'updateHistoryInterval');
            return $this->updateHistoryInterval($request);
        }

        return abort(403, 'Unauthorized');
    }

    /**
     * Checks the provided credentials against the expected credentials for the given action.
     */
    private function authenticateAction(Request $request, $action)
    {
        $credentials = [
            'getWriteStatus' => ['name' => 's5dD4fFsGfs5f4d', 'pass' => 'sd541gQfD5dEsQf556FdsLf'],
            'updateCimData' => ['name' => '654sHfdZs6', 'pass' => 'sdf4sdD45af662Gsdef'],
            'updateCimErrorData' => ['name' => 'ebJ3vdnv738kdndJSjsbnc', 'pass' => 'DUgnH8SCBd84DSJddfKSC'],
            'insertCimHistory' => ['name' => 'as65dRETgf46aTU6sadyK6', 'pass' => '658ydsS15FdsfHag154HV6hzjk'],
            'resetWriteMe' => ['name' => 'hgf4854fdgjtSdz6D', 'pass' => 'DF51S9651FFDS6DS5'],
            'getWebChanges' => ['name' => 'tr4h86Q5dsvaTE8j', 'pass' => '849uDzk8zGDku87sdG59'],
            'resetWebChange' => ['name' => 'gfdjGD984hdDsh69d4h', 'pass' => 'f66S5tjGD156ms'],
            'initializeCim' => ['name' => '65sDd4zh6a5sF4dgf', 'pass' => 's5d9Ffzs6HFd5za65s6G54h1'],
            'getEmailsForErrors' => ['name' => '5Hsdg5F454t5J1s', 'pass' => 'k4G551Fvcx5HD4lp'],
            'updatePassword' => ['name' => 'dsSf65dPsf4s', 'pass' => 'sd541Qf5dEsf56dsLf'],
            'updateHistoryInterval' => ['name' => 'i78GztGSAr16', 'pass' => 'b65uFGH16b1AS5'],
        ];

        if (!isset($credentials[$action])) {
            abort(403, 'Unauthorized');
        }

        $expected = $credentials[$action];

        if ($request->input('name') !== $expected['name'] || $request->input('pass') !== $expected['pass']) {
            abort(403, 'Unauthorized');
        }
    }

    private function validateCim(Request $request)
    {
        if (!$request->input('cim')) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'cim' => 'required|string',
        ]);


        $cim = Device::where('id', $validated['cim'])->first();

        if (!$cim) {
            $cim = Device::updateOrCreate(
                ['id' => $request->input('cim')],
                [
                    'display_type' => 1,
                    'ip' => null,
                    'script_version' => null,
                    'fw_version' => null,
                ]
            );

            if ($cim->wasRecentlyCreated) {
                $deviceDescription = DeviceDescription::create([
                    'device_id' => $cim->id,
                ]);

                $deviceData = DeviceData::create([
                    'device_id' => $cim->id,
                ]);

                $deviceParameterChange = DeviceParameterChange::create([
                    'device_id' => $cim->id,
                ]);
            }

            $webChanges = DeviceParameterChange::first(['id' => $cim->id]);

            $webChanges->update([
                'zmena_TO_cislo_krivky' => 0,
                'zmena_TO_posun_krivky' => 0,
                'zmena_TO_manualni_tep' => 0,
                'zmena_TUV' => 0,
                'zmena_TUV_tep' => 0,
                'zmena_TUV_l_z' => 0,
                'zmena_l_z_funkce' => 0,
                'zmena_TO_68' => 0,
                'zmena_TO_75' => 0,
                'zmena_TO_76' => 0,
                'zmena_TO_77' => 0,
                'zmena_TO_78' => 0,
                'zmena_TUV_99' => 0,
                'zmena_TUV_108' => 0,
                'zmena_TUV_109' => 0,
                'zmena_TUV_110' => 0,
                'zmena_TUV_111' => 0,
                'zmena_DZ_128' => 0,
                'zmena_DZ_133' => 0,
                'zmena_RT_193' => 0,
                'zmena_RT_195' => 0
            ]);
            // abort(403, 'Unauthorized');
        }

        return $cim;
    }

    private function getWriteStatus(Request $request)
    {
        $cim = $this->validateCim($request);
        $sendDataUntil = $cim->send_data_until ?? Carbon::now()->subSeconds(20)->toDateTimeString();
        $sendData = (int) $cim->send_data ?? 0;
        return "{$sendData},{$sendDataUntil}";
    }

    private function updateCimData(Request $request)
    {
        $cim = $this->validateCim($request);

        for ($i = 1; $i <= 48; $i++) {
            if (!$request->has($i)) {
                abort(403, 'Unauthorized');
            }
        }

        $x49 = $request->input('49');
        if ($x49 == 7777) {
            $x49 = null;
        }

        $cim->update([
            'last_activity' => $request->input('1'),
        ]);

        $dataToUpdate = [
            'TS1' => $request->input('30'),
            'TS2' => $request->input('31'),
            'TS3' => $request->input('32'),
            'TS4' => $request->input('33'),
            'TS5' => $request->input('34'),
            'TS6' => $request->input('35'),
            'TS7' => $request->input('36'),
            'TS8' => $request->input('37'),
            'PTO' => $request->input('39'),
            'PTUV' => $request->input('40'),
            'DZTO' => $request->input('28'),
            'DZTUV' => $request->input('29'),
            'rezim_reg' => $request->input('42'),
            'stav_venk_jed' => $request->input('43'),
            'stav_termostat' => $request->input('44'),
            'stav_hdo' => $request->input('45'),
            'stav_sezona' => $request->input('46'),
            'stav_komp' => $request->input('26'),
            'vykon_komp' => $request->input('27'),
            'cislo_chyby' => $request->input('25'),
            'TO_cislo_krivky' => $request->input('4'),
            'TO_posun_krivky' => $request->input('5'),
            'TO_manualni_tep' => $request->input('8'),
            'TUV' => $request->input('13'),
            'TUV_tep' => $request->input('14'),
            'TUV_l_z' => $request->input('2'),
            'l_z_funkce' => $request->input('3'),
            'TO_68' => $request->input('7'),
            'TO_75' => $request->input('9'),
            'TO_76' => $request->input('10'),
            'TO_77' => $request->input('11'),
            'TO_78' => $request->input('12'),
            'TUV_99' => $request->input('15'),
            'TUV_108' => $request->input('16'),
            'TUV_109' => $request->input('17'),
            'TUV_110' => $request->input('18'),
            'TUV_111' => $request->input('19'),
            'DZ_128' => $request->input('20'),
            'DZ_133' => $request->input('21'),
            'RT_193' => $request->input('23'),
            'RT_195' => $request->input('24'),
            'reg_66' => $request->input('6'),
            'reg_192' => $request->input('22'),
            'reg_681' => $request->input('38'),
            'reg_707' => $request->input('41'),
            'reg_745' => $request->input('47'),
            'reg_746' => $request->input('48'),
            'reg_humidity' => $x49
        ];

        if ($cim->data) {
            $cim->data->update($dataToUpdate);
        } else {
            $cim->data()->create($dataToUpdate);
        }

        return response()->noContent();
    }

    private function updateCimErrorData(Request $request)
    {
        $device = $this->validateCim($request);

        if (!$request->has('1') || !$request->has('2')) {
            abort(403, 'Unauthorized');
        }

        $device->update([
            'last_activity' => $request->input('1'),
            'error_code' => $request->input('2')
        ]);

        return response()->noContent();
    }

    private function insertCimHistory(Request $request)
    {
        $cim = $this->validateCim($request);

        for ($i = 1; $i <= 27; $i++) {
            if (!$request->has($i)) {
                abort(403, 'Unauthorized');
            }
        }

        $x23 = $request->input('23');
        if ($x23 == 7777) {
            $x23 = null;
        }

        DeviceHistory::create([
            'device_id' => $cim->id,
            'cas' => $request->input('1'),
            'TS1' => $request->input('2'),
            'TS2' => $request->input('3'),
            'TS3' => $request->input('4'),
            'TS4' => $request->input('5'),
            'TS5' => $request->input('6'),
            'TS6' => $request->input('7'),
            'TS7' => $request->input('8'),
            'TS8' => $request->input('9'),
            'PTO' => $request->input('10'),
            'PTUV' => $request->input('11'),
            'komp' => $request->input('12'),
            'kvyk' => $request->input('13'),
            'run' => $request->input('14'),
            'reg' => $request->input('15'),
            'vjedn' => $request->input('16'),
            'dzto' => $request->input('17'),
            'dztuv' => $request->input('18'),
            'tstat' => $request->input('19'),
            'hdo' => $request->input('20'),
            'obd' => $request->input('21'),
            'chyba' => $request->input('22'),
            'PT' => $x23,
            'PPT' => $request->input('24'),
            'RPT' => $request->input('25'),
            'Prtk' => $request->input('26'),
            'TpnVk' => $request->input('27')
        ]);

        $newErrorCode = (int) $request->input('22');
        $deviceId = $cim->id;

        $this->errorNotificationService->processErrorTransition($deviceId, $newErrorCode);

        return response()->noContent();
    }

    private function resetWriteMe(Request $request)
    {
        $cim = $this->validateCim($request);
        $cim->update(['send_data' => false]);
        return response()->noContent();
    }

    private function getWebChanges(Request $request)
    {
        $cim = $this->validateCim($request);

        $webChanges = DeviceParameterChange::where('device_id', $cim->id)->first();

        if (!$webChanges) {
            abort(403, 'Unauthorized');
        }

        return implode(',', [
            $webChanges->zmena_TO_cislo_krivky,
            $webChanges->TO_cislo_krivky,
            $webChanges->zmena_TO_posun_krivky,
            $webChanges->TO_posun_krivky,
            $webChanges->zmena_TO_manualni_tep,
            $webChanges->TO_manualni_tep,
            $webChanges->zmena_TUV,
            $webChanges->TUV,
            $webChanges->zmena_TUV_tep,
            $webChanges->TUV_tep,
            $webChanges->zmena_TUV_l_z,
            $webChanges->TUV_l_z,
            $webChanges->zmena_l_z_funkce,
            $webChanges->l_z_funkce,
            $webChanges->zmena_TO_68,
            $webChanges->TO_68,
            $webChanges->zmena_TO_75,
            $webChanges->TO_75,
            $webChanges->zmena_TO_76,
            $webChanges->TO_76,
            $webChanges->zmena_TO_77,
            $webChanges->TO_77,
            $webChanges->zmena_TO_78,
            $webChanges->TO_78,
            $webChanges->zmena_TUV_99,
            $webChanges->TUV_99,
            $webChanges->zmena_TUV_108,
            $webChanges->TUV_108,
            $webChanges->zmena_TUV_109,
            $webChanges->TUV_109,
            $webChanges->zmena_TUV_110,
            $webChanges->TUV_110,
            $webChanges->zmena_TUV_111,
            $webChanges->TUV_111,
            $webChanges->zmena_DZ_128,
            $webChanges->DZ_128,
            $webChanges->zmena_DZ_133,
            $webChanges->DZ_133,
            $webChanges->zmena_history_interval,
            $webChanges->history_interval,
            $webChanges->zmena_RT_193,
            $webChanges->RT_193,
            $webChanges->zmena_RT_195,
            $webChanges->RT_195
        ]);
    }

    private function resetWebChange(Request $request)
    {
        $cim = $this->validateCim($request);

        if (!$request->has('1')) {
            abort(403, 'Unauthorized');
        }

        $field = $request->input('1');

        $webChanges = DeviceParameterChange::where('device_id', $cim->id)->first();

        if (!$webChanges) {
            abort(403, 'Unauthorized');
        }

        if (!Schema::hasColumn($webChanges->getTable(), $field)) {
            abort(403, "Invalid field: {$field}");
        }

        $webChanges->update([$field => 0]);
        return response()->noContent();
    }

    private function initializeCim(Request $request)
    {
        if (!$request->has('cim') || !$request->has('1') || !$request->has('2') || !$request->has('3')) {
            abort(403, 'Unauthorized');
        }

        $cim = Device::updateOrCreate(
            ['id' => $request->input('cim')],
            [
                'display_type' => 1,
                'ip' => $request->input('3') ?? null,
                'script_version' => $request->input('1') ?? null,
                'fw_version' => $request->input('2') ?? null,
            ]
        );

        if ($cim->wasRecentlyCreated) {
            $deviceDescription = DeviceDescription::create([
                'device_id' => $cim->id,
            ]);

            $deviceData = DeviceData::create([
                'device_id' => $cim->id,
            ]);

            $deviceParameterChange = DeviceParameterChange::create([
                'device_id' => $cim->id,
            ]);
        }

        $webChanges = DeviceParameterChange::where('device_id', $cim->id)->first();

        $webChanges->update([
            'zmena_TO_cislo_krivky' => 0,
            'zmena_TO_posun_krivky' => 0,
            'zmena_TO_manualni_tep' => 0,
            'zmena_TUV' => 0,
            'zmena_TUV_tep' => 0,
            'zmena_TUV_l_z' => 0,
            'zmena_l_z_funkce' => 0,
            'zmena_TO_68' => 0,
            'zmena_TO_75' => 0,
            'zmena_TO_76' => 0,
            'zmena_TO_77' => 0,
            'zmena_TO_78' => 0,
            'zmena_TUV_99' => 0,
            'zmena_TUV_108' => 0,
            'zmena_TUV_109' => 0,
            'zmena_TUV_110' => 0,
            'zmena_TUV_111' => 0,
            'zmena_DZ_128' => 0,
            'zmena_DZ_133' => 0,
            'zmena_RT_193' => 0,
            'zmena_RT_195' => 0
        ]);

        return $cim->data->fhi;
    }

    private function getEmailsForErrors(Request $request)
    {
        $device = $this->validateCim($request);

        $users = $device->users()->wherePivot('notifications', 1)->get();

        $result = $users->map(function ($user) {
            return $user->email
                . "5f2)ssF!45dD!5dgfh!"
                . ($user->pivot->own_name ?? '')
                . "5f2)ssF!45dD!5dgfh!";
        })->implode('');

        return $result;
    }

    private function updatePassword(Request $request)
    {
        $cim = $this->validateCim($request);

        if (!$request->has('1')) {
            abort(403, 'Unauthorized');
        }

        $cim->update(['password' => Hash::make($request->input('1'))]);

        return response()->noContent();
    }

    private function updateHistoryInterval(Request $request)
    {
        $cim = $this->validateCim($request);

        if (!$request->has('1')) {
            abort(403, 'Unauthorized');
        }

        $cim->data->update(['fhi' => $request->input('1')]);

        return response()->noContent();
    }
}