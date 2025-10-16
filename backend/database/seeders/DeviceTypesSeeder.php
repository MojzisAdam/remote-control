<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DeviceTypesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        DB::table('device_types')->updateOrInsert(
            ['id' => 'cim'], // Primary key
            [
                'name' => 'CIM Heat Pump',
                'description' => 'CIM heat pump with all standard sensors and controls',
                'capabilities' => json_encode([
                ]),
                'mqtt_topics' => json_encode([
                    'automation' => [
                        'subscribe' => 'cim/v1/+/data/automation',
                        'command' => 'cim/v1/{device_id}/cmd/automation',
                        'description' => 'MQTT topics for automation triggers and commands'
                    ],
                ]),
                'created_at' => now(),
                'updated_at' => now()
            ]
        );
    }
}