<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NotificationTypesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            [
                'id' => 1,
                'name' => 'error_occurred',
                'description' => 'Error occurred on a device',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'name' => 'error_resolved',
                'description' => 'All errors have been resolved on a device',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'name' => 'automation',
                'description' => 'Automation-related notification',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('notification_types')->insert($types);
    }
}