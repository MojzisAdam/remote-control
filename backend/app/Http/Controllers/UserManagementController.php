<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Actions\Fortify\CreateNewUser;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Http\Resources\UserResource;
use App\Http\Resources\DeviceResource;
use App\Models\Device;

class UserManagementController extends Controller
{
    protected $createNewUser;
    public function __construct(CreateNewUser $createNewUser)
    {
        $this->createNewUser = $createNewUser;
    }
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->filled('search')) {
            $query->where('email', 'like', '%' . $request->search . '%')
                ->orWhere('first_name', 'like', '%' . $request->search . '%')
                ->orWhere('last_name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('sorting')) {
            foreach (explode(',', $request->sorting) as $sort) {
                [$column, $direction] = explode(':', $sort);
                $query->orderBy($column, $direction);
            }
        }

        $users = $query->paginate($request->get('pageSize', 10));

        return UserResource::collection($users);
    }

    public function store(Request $request)
    {
        $input = $request->input();
        $user = $this->createNewUser->create($input);
        $user->email_verified_at = now();
        $user->save();

        $user->syncRoles([]);
        $user->syncPermissions([]);

        if (isset($input['roles']) && !empty($input['roles'])) {
            $roleName = is_array($input['roles']) ? $input['roles'][0] : $input['roles'];
            $user->roles()->detach();
            $user->assignRole($roleName);
        }

        if (isset($input['permissions'])) {
            foreach ($input['permissions'] as $permission) {
                $user->givePermissionTo($permission);
            }
        }

        return response()->json(new UserResource($user), 201);
    }

    public function update(Request $request, User $user)
    {
        $input = $request->input();

        Validator::make($input, [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
        ])->validateWithBag('updateProfileInformation');

        $user->forceFill([
            'first_name' => $input['first_name'],
            'last_name' => $input['last_name'],
            'email' => $input['email'],
        ])->save();

        $user->syncRoles([]);
        $user->syncPermissions([]);

        if (isset($input['roles']) && !empty($input['roles'])) {
            $roleName = is_array($input['roles']) ? $input['roles'][0] : $input['roles'];
            $user->roles()->detach();
            $user->assignRole($roleName);
        }

        if (isset($input['permissions'])) {
            foreach ($input['permissions'] as $permission) {
                $user->givePermissionTo($permission);
            }
        }

        return new UserResource($user);
    }

    public function destroy(User $user)
    {
        $user->delete();

        return response()->json(null, 204);
    }

    // Method to update the last visited device
    public function updateLastVisitedDevice(Request $request)
    {
        $request->validate([
            'device_id' => 'required|exists:devices,id',
        ]);

        $user = Auth::user();

        $deviceId = $request->device_id;

        $user->lastVisitedDeviceId = $deviceId;
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Last visited device updated successfully.',
        ]);
    }

    // Method to get the last visited device details
    public function getLastVisitedDevice()
    {
        $user = Auth::user();

        if ($user->lastVisitedDeviceId) {
            $device = Device::find($user->lastVisitedDeviceId);
            return response()->json([
                'status' => 'success',
                'lastVisitedDevice' => new DeviceResource($device),
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'No last visited device found.',
        ], 404);
    }

    public function toggleDisplayLastVisitedDevice(Request $request)
    {
        $request->validate([
            'displayLastVisitedDevice' => 'required|boolean',
        ]);

        $user = Auth::user();

        $user->displayLastVisitedDevice = $request->displayLastVisitedDevice;
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Last visited device display preference updated successfully.',
        ]);
    }

    public function getDisplayLastVisitedDevice()
    {
        $user = Auth::user();

        return response()->json([
            'status' => 'success',
            'display_last_visited_device' => $user->display_last_visited_device,
        ]);
    }

    public function resetPassword(Request $request, User $user)
    {
        $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user->forceFill([
            'password' => Hash::make($request->password),
            'force_password_change' => true,
        ])->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Password reset successfully.',
        ]);
    }
}