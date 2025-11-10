<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DeviceDataSeeder extends Seeder
{
    public function run()
    {
        // First ensure devices exist
        $this->call(DeviceSeeder::class);

        $deviceId = '78ddef9';
        $startDate = Carbon::now()->subDay();
        $endDate = Carbon::now();
        $interval = 10;

        $batchSize = 1000;
        $data = [];

        while ($startDate->lessThan($endDate)) {
            $data[] = [
                'device_id' => $deviceId,
                'cas' => $startDate->toDateTimeString(),
                'TS1' => rand(20, 30) + (rand(0, 99) / 100),
                'TS2' => rand(15, 25) + (rand(0, 99) / 100),
                'TS3' => rand(18, 28) + (rand(0, 99) / 100),
                'TS4' => rand(10, 20) + (rand(0, 99) / 100),
                'TS5' => rand(10, 20) + (rand(0, 99) / 100),
                'TS6' => -128,
                'TS7' => -128,
                'TS8' => -128,
                'TS9' => -128,
                'PTO' => rand(30, 50) + (rand(0, 99) / 100),
                'PTUV' => rand(30, 70) + (rand(0, 99) / 100),
                'PTO2' => rand(30, 50) + (rand(0, 99) / 100),
                'komp' => rand(0, 1),
                'kvyk' => rand(0, 1000) / 10,
                'run' => rand(0, 1),
                'reg' => rand(0, 1),
                'vjedn' => rand(0, 1),
                'dzto' => rand(0, 1),
                'dztuv' => rand(0, 1),
                'tstat' => rand(0, 1),
                'hdo' => rand(0, 1),
                'obd' => rand(0, 1),
                'chyba' => rand(0, 80),
                'PT' => rand(1, 10) + (rand(0, 99) / 100),
                'PPT' => rand(1, 10) + (rand(0, 99) / 100),
                'RPT' => rand(1, 10) + (rand(0, 99) / 100),
                'Prtk' => rand(1, 10) + (rand(0, 99) / 100),
                'TpnVk' => rand(1, 10) + (rand(0, 99) / 100),
            ];

            if (count($data) >= $batchSize) {
                DB::table('device_history')->insertOrIgnore($data);
                $data = [];
            }

            $startDate->addMinutes($interval);
        }

        if (!empty($data)) {
            DB::table('device_history')->insertOrIgnore($data);
        }
    }
}