<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'manage-users',
            'manage-devices',
            'view-history',
            'edit-device-description',
            'view-notifications',
            'edit-all-parameters',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $userRole = Role::firstOrCreate(['name' => 'user']);
        $superUserRole = Role::firstOrCreate(['name' => 'superuser']);
        $administratorRole = Role::firstOrCreate(['name' => 'administrator']);
        $superAdminRole = Role::firstOrCreate(['name' => 'superadmin']);

        $superAdminRole->syncPermissions(Permission::all());

        $administratorRole->syncPermissions([
            'view-history',
            'edit-device-description',
            'view-notifications',
            'edit-all-parameters',
        ]);

        // Superuser: view history
        $superUserRole->syncPermissions(['view-history']);

        // Create a super admin user only if not in production.
        if (!app()->environment('production')) {
            $superAdminUser = User::firstOrCreate(
                ['email' => 'admin@example.com'],
                [
                    'first_name' => 'Admin',
                    'last_name' => 'User',
                    'password' => Hash::make('password'),
                ]
            );

            if (!$superAdminUser->hasRole('superadmin')) {
                $superAdminUser->assignRole($superAdminRole);
            }
        }

    }
}