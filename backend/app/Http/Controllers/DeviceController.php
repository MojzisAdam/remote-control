<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Device;
use App\Models\DeviceDescription;
use App\Models\DeviceParameterChange;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\DeviceResource;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\DeviceData;
use App\Http\Resources\UserResource;
use App\Models\DeviceParameterLog;
use App\Http\Resources\DeviceParameterLogResource;
use Exception;


class DeviceController extends Controller
{
    /**
     * List all devices added by the authenticated user.
     */
    public function listUserDevices()
    {
        $user = Auth::user();

        $devices = $user->devices()->with('description')->get();

        return response()->json([
            'status' => 'success',
            'devices' => DeviceResource::collection($devices),
        ]);
    }

    public function listDevices(Request $request)
    {
        $search = $request->query('search');
        $email = $request->query('email');
        $status = $request->query('status');

        $query = Device::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhereHas('description', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%")
                            ->orWhere('owner', 'like', "%{$search}%")
                            ->orWhere('zip_code', 'like', "%{$search}%")
                            ->orWhere('city', 'like', "%{$search}%")
                            ->orWhere('address', 'like', "%{$search}%")
                            ->orWhere('description', 'like', "%{$search}%")
                            ->orWhere('outdoor_unit_type', 'like', "%{$search}%");
                    });
            });
        }

        if ($email) {
            $query->whereHas('users', function ($q) use ($email) {
                $q->where('email', 'like', "%{$email}%");
            });
        }

        if ($status && $status !== 'all') {
            $tenMinutesAgo = Carbon::now()->subMinutes(10);
            if ($status === 'online') {
                $query->whereNotNull('last_activity')
                    ->where('error_code', 0)
                    ->where('last_activity', '>', $tenMinutesAgo);
            } elseif ($status === 'error') {
                $query->whereNotNull('last_activity')
                    ->where('error_code', '>', 0)
                    ->where('last_activity', '>', $tenMinutesAgo);
            } elseif ($status === 'offline') {
                $query->where(function ($q) use ($tenMinutesAgo) {
                    $q->whereNull('last_activity')
                        ->orWhere('last_activity', '<=', $tenMinutesAgo);
                });
            }
        }

        $devices = $query->paginate($request->get('pageSize', 10));

        return DeviceResource::collection($devices);
    }

    public function getDeviceUsers($deviceId)
    {
        $device = Device::findOrFail($deviceId);

        $users = $device->users;

        return response()->json([
            'status' => 'success',
            'users' => UserResource::collection($users),
        ]);
    }

    public function deviceSummary(Request $request)
    {
        $devices = Device::all();
        $tenMinutesAgo = Carbon::now()->subMinutes(10);

        $onlineCount = $devices->filter(function ($device) use ($tenMinutesAgo) {
            return $device->last_activity
                && Carbon::parse($device->last_activity)->gt($tenMinutesAgo)
                && $device->error_code == 0;
        })->count();

        $errorCount = $devices->filter(function ($device) use ($tenMinutesAgo) {
            return $device->last_activity
                && Carbon::parse($device->last_activity)->gt($tenMinutesAgo)
                && $device->error_code > 0;
        })->count();

        $offlineCount = $devices->count() - $onlineCount - $errorCount;

        return response()->json([
            'status' => 'success',
            'summary' => [
                'total' => $devices->count(),
                'online' => $onlineCount,
                'offline' => $offlineCount,
                'in_error' => $errorCount,
            ],
        ]);
    }

    public function getUserDevice(Request $request, $deviceId)
    {
        $user = Auth::user();

        $device = $user->devices()->where('device_id', $deviceId)->first();

        if (!$device) {
            return response()->json(['status' => 'error', 'message' => 'Device not found in user list.'], 404);
        }


        return response()->json(['status' => 'success', 'message' => 'Device updated successfully.', 'device' => new DeviceResource($device)]);
    }

    public function getDeviceStatusSummary(Request $request)
    {
        $user = Auth::user();

        $devices = $user->devices;

        $tenMinutesAgo = Carbon::now()->subMinutes(10);

        $activeDevices = $devices->where('last_activity', '>', $tenMinutesAgo);

        $errorCount = $activeDevices->where('error_code', '>', 0)->count();

        $onlineCount = $activeDevices->where('error_code', '=', 0)->count();

        $offlineCount = $devices->count() - ($errorCount + $onlineCount);

        return response()->json([
            'status' => 'success',
            'summary' => [
                'online' => $onlineCount,
                'in_error' => $errorCount,
                'offline' => $offlineCount,
            ],
        ]);
    }

    /**
     * Add a device by ID and password verification.
     */
    public function addDevice(Request $request)
    {
        $request->validate([
            'device_id' => 'required|string',
            'password' => 'required|string',
        ]);

        $device = Device::where('id', $request->device_id)->first();

        if (!$device || !Hash::check($request->password, $device->password)) {
            return response()->json(['status' => 'error', 'message' => 'Invalid device ID or password.'], 422);
        }

        $user = Auth::user();

        if ($user->devices()->where('device_id', $device->id)->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'You have already added this device.',
            ], 422);
        }
        $user->devices()->attach($device->id);

        return response()->json([
            'status' => 'success',
            'message' => 'Device added successfully.',
        ]);
    }

    /**
     * Modify a user's device.
     */
    public function updateUserDevice(Request $request, $deviceId)
    {
        $request->validate([
            'own_name' => 'nullable|string|max:100',
            'favourite' => 'nullable|boolean',
            'notifications' => 'nullable|boolean',
        ]);

        $user = Auth::user();

        $device = $user->devices()->where('device_id', $deviceId)->first();

        if (!$device) {
            return response()->json(['status' => 'error', 'message' => 'Device not found in user list.'], 404);
        }

        $pivotData = [];
        if ($request->has('own_name')) {
            $pivotData['own_name'] = $request->own_name;
        }
        if ($request->has('favourite')) {
            if ($request->favourite) {
                $maxOrder = $user->devices()->max('device_user.favouriteOrder');
                $newOrder = $maxOrder + 1;

                $pivotData['favourite'] = true;
                $pivotData['favouriteOrder'] = $newOrder;
            } else {
                $pivotData['favourite'] = false;
                $pivotData['favouriteOrder'] = -1;
            }
        }
        if ($request->has('notifications')) {
            $pivotData['notifications'] = $request->notifications;
        }

        $user->devices()->updateExistingPivot($deviceId, $pivotData);

        return response()->json(['status' => 'success', 'message' => 'Device updated successfully.']);
    }

    public function updateFavouriteOrder(Request $request)
    {
        $request->validate([
            'devices' => 'required|array',
            'devices.*.deviceId' => 'required|string|exists:devices,id',
            'devices.*.favouriteOrder' => 'required|integer|min:1',
        ]);

        $user = Auth::user();
        $devicesData = $request->input('devices');

        DB::beginTransaction();

        try {
            foreach ($devicesData as $deviceData) {
                $device = $user->devices()->where('device_id', $deviceData['deviceId'])->first();

                if ($device) {
                    $user->devices()->updateExistingPivot($deviceData['deviceId'], [
                        'favouriteOrder' => $deviceData['favouriteOrder'],
                    ]);
                } else {
                    throw new \Exception("Device with ID {$deviceData['deviceId']} not found.");
                }
            }

            DB::commit();

            return response()->json(['status' => 'success', 'message' => 'Favourite order updated successfully.']);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['status' => 'error', 'message' => 'Failed to update favourite order. ' . $e->getMessage()], 500);
        }
    }


    /**
     * Edit DeviceDescription for users with permission.
     */
    public function updateDeviceDescription(Request $request, $deviceId)
    {
        $request->validate([
            'name' => 'nullable|string|max:255',
            'owner' => 'nullable|string|max:255',
            'zip_code' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'outdoor_unit_type' => 'nullable|string|max:255',
            'installation_date' => 'nullable|date',
        ]);

        $user = Auth::user();

        if (!$user->can('edit-device-description')) {
            return response()->json(['status' => 'error', 'message' => 'Permission denied.'], 403);
        }

        $deviceDescription = DeviceDescription::where('device_id', $deviceId)->first();

        if (!$deviceDescription) {
            return response()->json(['status' => 'error', 'message' => 'Device description not found.'], 404);
        }

        $deviceDescription->update($request->all());

        return response()->json(['status' => 'success', 'message' => 'Device description updated successfully.']);
    }

    /**
     * Retrieve favorite devices for the authenticated user.
     */
    public function getFavoriteDevices()
    {
        $user = Auth::user();

        $devices = $user->devices()->wherePivot('favourite', 1)->get();

        return response()->json([
            'status' => 'success',
            'devices' => DeviceResource::collection($devices),
        ]);
    }

    public function updateOrCreateDevice(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string',
            'password' => 'present|nullable|string',
            'display_type' => 'required|string',
            'ip' => 'nullable|ip',
            'error_code' => 'nullable|integer',
            'script_v' => 'nullable|string',
            'fw_v' => 'nullable|string',
        ]);

        try {
            $device = Device::updateOrCreate(
                ['id' => $validated['id']],
                [
                    'password' => Hash::make($validated['password']),
                    'display_type' => $validated['display_type'],
                    'last_activity' => Carbon::now(),
                    'ip' => $validated['ip'] ?? null,
                    'error_code' => $validated['error_code'] ?? 0,
                    'script_version' => $validated['script_v'] ?? null,
                    'fw_version' => $validated['fw_v'] ?? null,
                ]
            );
            if ($device->wasRecentlyCreated) {
                $deviceDescription = DeviceDescription::create([
                    'device_id' => $device->id,
                ]);

                $deviceData = DeviceData::create([
                    'device_id' => $device->id,
                ]);

                $deviceParameterChange = DeviceParameterChange::create([
                    'device_id' => $device->id,
                ]);
            }

            return response()->json([
                'status' => 'success',
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function removeUserDevice(Request $request, $deviceId)
    {
        $user = Auth::user();

        $device = $user->devices()->where('id', $deviceId)->first();

        if (!$device) {
            return response()->json([
                'status' => 'error',
                'message' => 'Device not found in your list.'
            ], 404);
        }

        $user->devices()->detach($deviceId);

        return response()->json([
            'status' => 'success',
            'message' => 'Device removed successfully.'
        ]);
    }

    public function addDeviceToList(Request $request)
    {
        $request->validate([
            'device_id' => 'required|string',
            'own_name' => 'nullable|string|max:255',
        ]);

        $device = Device::where('id', $request->device_id)->first();

        if (!$device) {
            return response()->json([
                'status' => 'error',
                'message' => 'Device not found.',
            ], 422);
        }

        $user = Auth::user();

        if ($user->devices()->where('device_id', $device->id)->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'You have already added this device.',
            ], 422);
        }

        $user->devices()->attach($device->id, ['own_name' => $request->own_name]);

        return response()->json([
            'status' => 'success',
            'message' => 'Device added successfully.',
        ]);
    }

    public function getParameterLogs(Request $request, $deviceId)
    {
        $query = DeviceParameterLog::where('device_id', $deviceId);
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('email', 'like', '%' . $search . '%');
        }

        if ($request->filled('sorting')) {
            foreach (explode(',', $request->sorting) as $sort) {
                [$column, $direction] = explode(':', $sort);
                $query->orderBy($column, $direction);
            }
        }
        $logs = $query->paginate($request->get('pageSize', 10));

        return DeviceParameterLogResource::collection($logs);

    }

    public function logParameterChange(Request $request, $deviceId)
    {
        $validated = $request->validate([
            'parameter' => 'required|string',
            'old_value' => 'required|string',
            'new_value' => 'required|string',
        ]);

        $user = Auth::user();

        try {
            $log = DeviceParameterLog::create([
                'device_id' => $deviceId,
                'user_id' => $user->id,
                'email' => $user->email,
                'parameter' => $validated['parameter'],
                'old_value' => $validated['old_value'] ?? null,
                'new_value' => $validated['new_value'],
                'changed_at' => Carbon::now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Parameter change logged successfully',
                'data' => new DeviceParameterLogResource($log),
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateVersions(Request $request, $deviceId)
    {
        $request->validate([
            'fw_version' => 'required|string',
            'script_version' => 'required|string',
        ]);

        try {
            $device = Device::findOrFail($deviceId);

            $device->update([
                'fw_version' => $request->fw_version,
                'script_version' => $request->script_version,
            ]);

            return response()->json([
                'message' => 'Device versions updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update device versions',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}