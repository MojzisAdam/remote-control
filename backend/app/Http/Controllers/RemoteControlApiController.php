<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\DeviceData;
use App\Models\DeviceParameterChange;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use App\Http\Resources\DeviceResource;


class RemoteControlApiController extends Controller
{
    /**
     * Start the remote control session
     */
    public function startSession(Request $request, $deviceId)
    {
        $device = Device::findOrFail($deviceId);

        $device->send_data = true;
        $device->send_data_until = Carbon::now()->addMinutes(20);
        $device->save();

        return response()->json([
            'success' => true,
            'message' => 'Remote control session started',
            'device' => new DeviceResource($device)
        ]);
    }

    /**
     * Check device connectivity status
     */
    public function checkConnection($deviceId)
    {
        $device = Device::findOrFail($deviceId);

        $status = [
            'send_data' => (bool) $device->send_data,
            'last_activity' => $device->last_activity,
            'send_data_until' => $device->send_data_until,
        ];

        return response()->json($status);
    }

    /**
     * Get latest device data
     */
    public function getDeviceData($deviceId)
    {
        $device = Device::findOrFail($deviceId);
        $deviceData = DeviceData::where('device_id', $deviceId)
            ->latest()
            ->first();

        if (!$deviceData) {
            return response()->json([
                'success' => false,
                'message' => 'No data available for this device'
            ], 404);
        }

        $formattedData = $this->formatDeviceData($deviceData);

        return response()->json([
            'success' => true,
            'data' => $formattedData,
            "status" => [
                'send_data' => (bool) $device->send_data,
                'last_activity' => $device->last_activity,
                'send_data_until' => $device->send_data_until,
            ]
        ]);
    }

    /**
     * Update device parameter
     */
    public function updateParameter(Request $request, $deviceId)
    {
        $data = $request->validate([
            'register' => 'required',
            'value' => 'required|numeric'
        ]);

        if (is_numeric($data['register'])) {
            $regName = 'reg_' . $data['register'];
        } else {
            $regName = $data['register'];
        }

        $paramMap = [
            'reg_33' => 'TUV_l_z',
            'reg_35' => 'l_z_funkce',
            'reg_64' => 'TO_cislo_krivky',
            'reg_65' => 'TO_posun_krivky',
            'reg_66' => 'reg_66',
            'reg_68' => 'TO_68',
            'reg_71' => 'TO_manualni_tep',
            'reg_75' => 'TO_75',
            'reg_76' => 'TO_76',
            'reg_77' => 'TO_77',
            'reg_78' => 'TO_78',
            'reg_96' => 'TUV',
            'reg_97' => 'TUV_tep',
            'reg_99' => 'TUV_99',
            'reg_108' => 'TUV_108',
            'reg_109' => 'TUV_109',
            'reg_110' => 'TUV_110',
            'reg_111' => 'TUV_111',
            'reg_128' => 'DZ_128',
            'reg_133' => 'DZ_133',
            'reg_192' => 'reg_192',
            'reg_193' => 'RT_193',
            'reg_195' => 'RT_195',
            'fhi' => 'history_interval',
        ];

        if (!array_key_exists($regName, $paramMap)) {
            return response()->json([
                'success' => false,
                'message' => "Unknown parameter: $regName"
            ], 400);
        }

        $dbField = $paramMap[$regName];

        $parameterRecord = DeviceParameterChange::updateOrCreate(
            ['device_id' => $deviceId],
            []
        );

        if ($dbField == "RT_193" or $dbField == "RT_195") {
            $parameterRecord->$dbField = $data['value'] / 10;
        } else {
            $parameterRecord->$dbField = $data['value'];
        }

        $flagField = 'zmena_' . $dbField;
        $parameterRecord->$flagField = 1;
        $parameterRecord->save();

        return response()->json([
            'success' => true,
            'message' => "Parameter $regName updated successfully"
        ]);
    }

    /**
     * End the remote control session
     */
    public function endSession($deviceId)
    {
        $device = Device::findOrFail($deviceId);
        $device->send_data = false;
        // $device->send_data_until = null;
        $device->save();

        return response()->json([
            'success' => true,
            'message' => 'Remote control session ended'
        ]);
    }


    /**
     * Format device data to match the DeviceData interface expected by the frontend
     */
    private function formatDeviceData($deviceData)
    {
        $data = [
            'reg_33' => $deviceData->TUV_l_z,
            'reg_35' => $deviceData->l_z_funkce,
            'reg_64' => $deviceData->TO_cislo_krivky,
            'reg_65' => $deviceData->TO_posun_krivky,
            'reg_66' => $deviceData->reg_66,
            'reg_68' => $deviceData->TO_68,
            'reg_71' => $deviceData->TO_manualni_tep,
            'reg_75' => $deviceData->TO_75,
            'reg_76' => $deviceData->TO_76,
            'reg_77' => $deviceData->TO_77,
            'reg_78' => $deviceData->TO_78,
            'reg_96' => $deviceData->TUV,
            'reg_97' => $deviceData->TUV_tep,
            'reg_99' => $deviceData->TUV_99,
            'reg_108' => $deviceData->TUV_108,
            'reg_109' => $deviceData->TUV_109,
            'reg_110' => $deviceData->TUV_110,
            'reg_111' => $deviceData->TUV_111,
            'reg_128' => $deviceData->DZ_128,
            'reg_133' => $deviceData->DZ_133,
            'reg_192' => $deviceData->reg_192,
            'reg_193' => $deviceData->RT_193 * 10,
            'reg_195' => $deviceData->RT_195 * 10,
            'reg_512' => $deviceData->cislo_chyby,
            'reg_608' => $deviceData->stav_komp,
            'reg_610' => $deviceData->vykon_komp,
            'reg_640' => $deviceData->DZTO,
            'reg_646' => $deviceData->DZTUV,
            'reg_673' => $deviceData->TS1,
            'reg_674' => $deviceData->TS2,
            'reg_675' => $deviceData->TS3,
            'reg_676' => $deviceData->TS4,
            'reg_677' => $deviceData->TS5,
            'reg_678' => $deviceData->TS6,
            'reg_679' => $deviceData->TS7,
            'reg_680' => $deviceData->TS8,
            'reg_681' => $deviceData->reg_681,
            'reg_704' => $deviceData->PTO,
            'reg_705' => $deviceData->PTUV,
            'reg_707' => $deviceData->reg_707,
            'reg_736' => $deviceData->rezim_reg,
            'reg_737' => $deviceData->stav_venk_jed,
            'reg_739' => $deviceData->stav_termostat,
            'reg_740' => $deviceData->stav_hdo,
            'reg_741' => $deviceData->stav_sezona,
            'reg_745' => $deviceData->reg_745,
            'reg_746' => $deviceData->reg_746,
            'she_hum' => $deviceData->reg_humidity,
            'fw_v' => $deviceData->device->fw_version,
            'fhi' => $deviceData->fhi,
        ];

        return array_filter($data, function ($value) {
            return !is_null($value);
        });
    }

}