<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DeviceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $devices = [
            [
                'id' => "123456", 
                'password' => bcrypt('device123'),
                'ip' => '192.168.1.10',
                'display_type' => '1',
                'script_version' => '1.2.3',
                'fw_version' => '2.1.0',
                'last_activity' => now(),
                'history__writing_interval' => 60,
                'send_data' => true,
                'send_data_until' => now()->addDays(7),
                'error_code' => 0
            ],
            [
                'id' => "654321",
                'password' => bcrypt('device456'),
                'ip' => '192.168.1.11',
                'display_type' => '1',
                'script_version' => '1.2.5',
                'fw_version' => '2.2.0',
                'last_activity' => now()->subHours(5),
                'history__writing_interval' => 120,
                'send_data' => false,
                'send_data_until' => null,
                'error_code' => 1
            ],
            [
                'id' => "123456789",
                'password' => bcrypt('device789'),
                'ip' => '192.168.1.12',
                'display_type' => '2',
                'script_version' => '1.3.0',
                'fw_version' => '2.3.1',
                'last_activity' => now()->subDays(2),
                'history__writing_interval' => 30,
                'send_data' => true,
                'send_data_until' => now()->addDays(3),
                'error_code' => 0
            ],
        ];

        DB::table('devices')->insert($devices);
    }
}

