<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            NotificationTypesSeeder::class,
            RolesAndPermissionsSeeder::class,
            DeviceSeeder::class,
            DeviceDataSeeder::class,
            // Add other seeders here as needed
        ]);
    }
}
