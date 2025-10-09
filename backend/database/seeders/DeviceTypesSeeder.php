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
                    "reg_35" => ["type" => "enum", "role" => ["action"], "register" => 35, "default_value" => 0, "description" => "Summer/Winter Mode", "values" => [["label" => "Auto", "value" => 0], ["label" => "Summer", "value" => 1], ["label" => "Winter", "value" => 2]]],
                    "reg_96" => ["type" => "boolean", "role" => ["action"], "register" => 96, "default_value" => 1, "description" => "DHW", "labels" => ["0" => "Inactive", "1" => "DHW Heating Enabled"]],
                    "reg_97" => ["type" => "number", "role" => ["action"], "register" => 97, "default_value" => 46, "unit" => "°C", "min_value" => 20, "max_value" => 70, "increment_value" => 1, "description" => "DHW Temperature"],
                    "reg_673" => ["type" => "number", "role" => ["trigger", "condition"], "unit" => "°C", "description" => "Výstupní teplota z výměníku"],
                    "reg_674" => ["type" => "number", "role" => ["trigger", "condition"], "unit" => "°C", "description" => "Venkovní teplota vzduchu"],
                    "reg_675" => ["type" => "number", "role" => ["trigger", "condition"], "unit" => "°C", "description" => "Vratná teplota / zpátečka"],
                    "reg_676" => ["type" => "number", "role" => ["trigger", "condition"], "unit" => "°C", "description" => "Teplota TUV (bojler)"],
                    "reg_677" => ["type" => "number", "role" => ["trigger", "condition"], "unit" => "°C", "description" => "Prostorová teplota"],
                    "reg_678" => ["type" => "number", "role" => ["trigger", "condition"], "unit" => "°C", "description" => "Akumulační nádoba"],
                    "reg_679" => ["type" => "number", "role" => ["trigger", "condition"], "unit" => "°C", "description" => "Topný okruh 2 (TO2) teplota"],
                    "reg_680" => ["type" => "number", "role" => ["trigger", "condition"], "unit" => "°C", "description" => "Teplota bazénu"],
                    "reg_685" => ["type" => "number", "role" => ["trigger", "condition"], "unit" => "°C", "description" => "Teplota kapalného chladiva"],
                    "reg_704" => ["type" => "number", "role" => ["trigger", "condition"], "unit" => "°C", "description" => "Požadavek TO"],
                    "reg_705" => ["type" => "number", "role" => ["trigger", "condition"], "unit" => "°C", "description" => "Požadavek TUV"],
                    "reg_708" => ["type" => "number", "role" => ["trigger", "condition"], "unit" => "°C", "description" => "Požadavek TO2"],
                    "reg_681" => ["type" => "number", "role" => ["trigger", "condition"], "unit" => "°C", "description" => "Prostorová teplota z externího čidla"],
                    "reg_707" => ["type" => "number", "role" => ["trigger", "condition"], "unit" => "°C", "description" => "Požadavek PT"],
                    "reg_608" => ["type" => "boolean", "role" => ["trigger", "condition"], "description" => "Stav kompresoru"],
                    "reg_610" => ["type" => "number", "role" => ["trigger", "condition"], "unit" => "%", "description" => "Výkon kompresoru"],
                    "reg_640" => ["type" => "enum", "role" => ["trigger", "condition"], "description" => "Stav DZTO", "values" => [["label" => "OFF", "value" => 0], ["label" => "BS Level 1", "value" => 1], ["label" => "BS Level M", "value" => 2], ["label" => "BS Level 2", "value" => 3], ["label" => "ADD", "value" => 4]]],
                    "reg_646" => ["type" => "enum", "role" => ["trigger", "condition"], "description" => "Stav DZTUV", "values" => [["label" => "OFF", "value" => 0], ["label" => "BS Level 1", "value" => 1], ["label" => "BS Level M", "value" => 2], ["label" => "BS Level 2", "value" => 3], ["label" => "ADD", "value" => 4]]],
                    "reg_736" => ["type" => "enum", "role" => ["trigger", "condition"], "description" => "Režim regulátoru", "values" => [["label" => "Idle", "value" => 0], ["label" => "DHW", "value" => 1], ["label" => "HC", "value" => 2], ["label" => "COOL", "value" => 3], ["label" => "Heat", "value" => 4], ["label" => "Pool", "value" => 5], ["label" => "HC+DHW", "value" => 6], ["label" => "COOL+DHW", "value" => 7], ["label" => "Pool+DHW", "value" => 8]]],
                    "reg_737" => ["type" => "boolean", "role" => ["trigger", "condition"], "description" => "Stav venkovní jednotky", "values" => [["label" => "OFF", "value" => 0], ["label" => "Heating", "value" => 1], ["label" => "Defrosting", "value" => 2], ["label" => "Cooling", "value" => 3]]],
                    "reg_739" => ["type" => "boolean", "role" => ["trigger", "condition"], "description" => "Stav blokace termostatem"],
                    "reg_740" => ["type" => "boolean", "role" => ["trigger", "condition"], "description" => "Stav blokace HDO"],
                    "reg_741" => ["type" => "boolean", "role" => ["trigger", "condition"], "description" => "Stav sezona", "labels" => ["0" => "Winter", "1" => "Summer"]],
                    "reg_512" => ["type" => "number", "role" => ["trigger", "condition"], "description" => "Číslo chyby"]
                ]),
                'mqtt_topics' => json_encode([
                    'automation' => [
                        'subscribe' => 'cim/v1/+/data/automation',
                        'command' => 'cim/v1/{device_id}/cmd/automation',
                        'description' => 'MQTT topics for automation triggers and commands'
                    ],
                    'data' => [
                        'subscribe' => 'cim/v1/+/data',
                        'description' => 'General data subscription topic'
                    ],
                    'status' => [
                        'subscribe' => 'cim/v1/+/status',
                        'description' => 'Device status topic'
                    ]
                ]),
                'created_at' => now(),
                'updated_at' => now()
            ]
        );
    }
}