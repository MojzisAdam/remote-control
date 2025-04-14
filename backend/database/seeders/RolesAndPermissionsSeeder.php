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
            'manage-divices',
            'view-history',
            'edit-device-description',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        $userRole = Role::create(['name' => 'user']);
        $superUserRole = Role::create(['name' => 'superuser']);
        $administratorRole = Role::create(['name' => 'administrator']);
        $superAdminRole = Role::create(['name' => 'superadmin']);

        $superAdminRole->givePermissionTo(Permission::all());

        $administratorRole->givePermissionTo(['view-history']);
        $administratorRole->givePermissionTo(['edit-device-description']);

        // Create a super admin user only if not in production.
        if (!app()->environment('production')) {
            $superAdminUser = User::factory()->create([
                'first_name' => 'Admin',
                'last_name' => 'User',
                'email' => 'admin@example.com',
                'password' => Hash::make('password'),
            ]);

            $superAdminUser->assignRole($superAdminRole);
        }

    }
}