<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\DeviceType;

class DeviceTypesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        DeviceType::firstOrCreate(
            ['id' => 'cim'], // Primary key
            [
                'name' => 'CIM Heat Pump',
                'description' => 'CIM heat pump with all standard sensors and controls',
                'capabilities' => [
                    'reg_99' => [
                        'type' => 'enum',
                        'role' => ['condition', 'trigger', 'action'],
                        'description' => ['en' => 'Summer/Winter', 'cs' => 'Léto/zima'],
                        'values' => [
                            ['label' => ['en' => 'Summer', 'cs' => 'Léto'], 'value' => 0],
                            ['label' => ['en' => 'Winter', 'cs' => 'Zima'], 'value' => 2]
                        ]
                    ],
                    'reg_35' => [
                        'type' => 'boolean',
                        'role' => ['trigger', 'condition', 'action'],
                        'description' => ['en' => 'DHW', 'cs' => 'TUV'],
                        'labels' => [
                            ['en' => 'On', 'cs' => 'Vypnuto'],
                            ['en' => 'Off', 'cs' => 'Zapnuto']
                        ]
                    ]
                ],
                'mqtt_topics' => [
                    'automation' => [
                        'subscribe' => 'cim/v1/+/data/automation',
                        'command' => 'cim/v1/{device_id}/cmd/automation',
                        'description' => 'MQTT topics for automation triggers and commands'
                    ],
                ],
                'created_at' => now(),
                'updated_at' => now()
            ]
        );
    }
}