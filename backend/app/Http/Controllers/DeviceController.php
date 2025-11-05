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
use Illuminate\Support\Facades\Log;
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
            return response()->json(['status' => 'error', 'message' => __('devices.not_found_in_user_list')], 404);
        }


        return response()->json(['status' => 'success', 'message' => __('devices.updated_successfully'), 'device' => new DeviceResource($device)]);
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
            return response()->json(['status' => 'error', 'message' => __('devices.invalid_id_or_password')], 422);
        }

        $user = Auth::user();

        if ($user->devices()->where('device_id', $device->id)->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => __('devices.already_added'),
            ], 422);
        }
        $user->devices()->attach($device->id);

        return response()->json([
            'status' => 'success',
            'message' => __('devices.added_successfully'),
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
            'web_notifications' => 'nullable|boolean',
        ]);

        $user = Auth::user();

        $device = $user->devices()->where('device_id', $deviceId)->first();

        if (!$device) {
            return response()->json(['status' => 'error', 'message' => __('devices.not_found_in_user_list')], 404);
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

        if ($request->has('web_notifications')) {
            $pivotData['web_notifications'] = $request->web_notifications;
        }


        $user->devices()->updateExistingPivot($deviceId, $pivotData);

        return response()->json(['status' => 'success', 'message' => __('devices.updated_successfully')]);
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
                    throw new \Exception(__('devices.not_found', ['id' => $deviceData['deviceId']]));
                }
            }

            DB::commit();

            return response()->json(['status' => 'success', 'message' => __('devices.favourite_order_updated')]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['status' => 'error', 'message' => __('devices.favourite_order_update_failed') . ' ' . $e->getMessage()], 500);
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
            return response()->json(['status' => 'error', 'message' => __('devices.permission_denied')], 403);
        }

        $deviceDescription = DeviceDescription::where('device_id', $deviceId)->first();

        if (!$deviceDescription) {
            return response()->json(['status' => 'error', 'message' => __('devices.description_not_found')], 404);
        }

        $deviceDescription->update($request->all());

        return response()->json(['status' => 'success', 'message' => __('devices.description_updated')]);
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
            'device_type_id' => 'nullable|string|exists:device_types,id',
            'ip' => 'nullable|ip',
            'error_code' => 'nullable|integer',
            'script_v' => 'nullable|string',
            'fw_v' => 'nullable|string',
        ]);

        try {
            return DB::transaction(function () use ($validated) {
                $updateData = [
                    'display_type' => $validated['display_type'],
                    'device_type_id' => $validated['device_type_id'] ?? null,
                    'last_activity' => now(),
                    'ip' => $validated['ip'] ?? null,
                    'error_code' => $validated['error_code'] ?? 0,
                    'script_version' => $validated['script_v'] ?? null,
                    'fw_version' => $validated['fw_v'] ?? null,
                ];

                $device = Device::where('id', $validated['id'])->first();

                if (!empty($validated['password'])) {
                    if (!$device || !Hash::check($validated['password'], $device->password)) {
                        $updateData['password'] = Hash::make($validated['password']);
                    }
                }

                $wasCreated = false;

                if ($device) {
                    $changed = false;
                    foreach ($updateData as $key => $value) {
                        if ($device->$key !== $value) {
                            $device->$key = $value;
                            $changed = true;
                        }
                    }

                    if ($changed) {
                        $device->save();
                    }
                } else {
                    $device = Device::create(array_merge(['id' => $validated['id']], $updateData));
                    $wasCreated = true;
                }

                return response()->json([
                    'status' => 'success',
                ], $wasCreated ? 201 : 200);
            });
        } catch (\Exception $e) {
            Log::error('Device update failed: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Internal server error',
            ], 500);
        }
    }

    public function removeUserDevice(Request $request, $deviceId)
    {
        $user = Auth::user();

        $device = $user->devices()->where('id', $deviceId)->first();

        if (!$device) {
            return response()->json([
                'status' => 'error',
                'message' => __('devices.not_found_in_your_list')
            ], 404);
        }

        $user->devices()->detach($deviceId);

        return response()->json([
            'status' => 'success',
            'message' => __('devices.removed_successfully')
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
                'message' => __('devices.not_found'),
            ], 422);
        }

        $user = Auth::user();

        if ($user->devices()->where('device_id', $device->id)->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => __('devices.already_added'),
            ], 422);
        }

        $user->devices()->attach($device->id, ['own_name' => $request->own_name]);

        return response()->json([
            'status' => 'success',
            'message' => __('devices.added_successfully'),
        ]);
    }

    public function addDeviceToUser(Request $request)
    {
        $request->validate([
            'device_id' => 'required|string|exists:devices,id',
            'user_email' => 'required|email',
            'own_name' => 'nullable|string|max:255',
        ]);

        // Find the device
        $device = Device::where('id', $request->device_id)->first();

        if (!$device) {
            return response()->json([
                'status' => 'error',
                'message' => __('devices.not_found'),
            ], 404);
        }

        // Find the user by email
        $user = User::where('email', $request->user_email)->first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => __('devices.user_not_found'),
            ], 404);
        }

        // Check if the user already has this device
        if ($user->devices()->where('device_id', $device->id)->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => __('devices.user_already_has_device'),
            ], 422);
        }

        // Add the device to the user's list
        $user->devices()->attach($device->id, ['own_name' => $request->own_name]);

        return response()->json([
            'status' => 'success',
            'message' => __('devices.device_added_to_user'),
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
                'message' => __('devices.parameter_change_logged'),
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
                'message' => __('devices.versions_updated')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => __('devices.versions_update_failed'),
                'error' => $e->getMessage()
            ], 500);
        }
    }
}