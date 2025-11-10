<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Device;

class DeviceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        // First ensure device types exist
        $this->call(DeviceTypesSeeder::class);

        $devices = [
            [
                'id' => "78ddef9",
                'password' => bcrypt('123'),
                'ip' => '192.168.1.10',
                'device_type_id' => 'cim',
                'display_type' => '1',
                'script_version' => '1.2.3',
                'fw_version' => '2.1.0',
                'last_activity' => now(),
            ],
            [
                'id' => "123abc4",
                'password' => bcrypt('123'),
                'ip' => '192.168.1.11',
                'device_type_id' => 'cim',
                'display_type' => '1',
                'script_version' => '1.2.5',
                'fw_version' => '2.2.0',
                'last_activity' => now()->subHours(5),
            ],
            [
                'id' => "ABEDF12",
                'password' => bcrypt('123'),
                'ip' => '192.168.1.12',
                'device_type_id' => 'cim',
                'display_type' => '2',
                'script_version' => '1.3.0',
                'fw_version' => '2.3.1',
                'last_activity' => now()->subDays(2),
            ],
        ];

        foreach ($devices as $deviceData) {
            Device::firstOrCreate($deviceData);
        }
    }
}