<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\DeviceType;
use App\Models\Device;
use App\Services\DeviceTypeMqttTopicService;
use App\Http\Resources\DeviceResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Exception;

class DeviceTypeController extends Controller
{
    protected DeviceTypeMqttTopicService $mqttTopicService;

    public function __construct(DeviceTypeMqttTopicService $mqttTopicService)
    {
        $this->mqttTopicService = $mqttTopicService;
    }

    // ====================================
    // CRUD Operations
    // ====================================

    /**
     * List all device types
     */
    public function index(Request $request): JsonResponse
    {
        $query = DeviceType::query();

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $deviceTypes = $query->get();

        return response()->json([
            'status' => 'success',
            'device_types' => $deviceTypes,
        ]);
    }

    /**
     * Get a specific device type
     */
    public function show(string $id): JsonResponse
    {
        $deviceType = DeviceType::find($id);

        if (!$deviceType) {
            return response()->json([
                'status' => 'error',
                'message' => __('device_types.not_found')
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'device_type' => $deviceType,
        ]);
    }

    /**
     * Create a new device type
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();

        // Check if user has permission
        if (!$user->can('manage-device-types')) {
            return response()->json([
                'status' => 'error',
                'message' => __('device_types.permission_denied')
            ], 403);
        }

        $validated = $request->validate([
            'id' => 'required|string|unique:device_types,id',
            'name' => 'required|string|unique:device_types,name|max:255',
            'description' => 'nullable|string',
            'capabilities' => 'required|array',
            'mqtt_topics' => 'nullable|array',
        ]);

        try {
            $deviceType = DeviceType::create($validated);

            return response()->json([
                'status' => 'success',
                'message' => __('device_types.created_successfully'),
                'device_type' => $deviceType,
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => __('device_types.creation_failed'),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a device type
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = Auth::user();

        // Check if user has permission
        if (!$user->can('manage-device-types')) {
            return response()->json([
                'status' => 'error',
                'message' => __('device_types.permission_denied')
            ], 403);
        }

        $deviceType = DeviceType::find($id);

        if (!$deviceType) {
            return response()->json([
                'status' => 'error',
                'message' => __('device_types.not_found')
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|unique:device_types,name,' . $id . '|max:255',
            'description' => 'nullable|string',
            'capabilities' => 'sometimes|array',
            'mqtt_topics' => 'nullable|array',
        ]);

        try {
            $deviceType->update($validated);

            return response()->json([
                'status' => 'success',
                'message' => __('device_types.updated_successfully'),
                'device_type' => $deviceType->fresh(),
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => __('device_types.update_failed'),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a device type
     */
    public function destroy(string $id): JsonResponse
    {
        $user = Auth::user();

        // Check if user has permission
        if (!$user->can('manage-device-types')) {
            return response()->json([
                'status' => 'error',
                'message' => __('device_types.permission_denied')
            ], 403);
        }

        $deviceType = DeviceType::find($id);

        if (!$deviceType) {
            return response()->json([
                'status' => 'error',
                'message' => __('device_types.not_found')
            ], 404);
        }

        // Check if there are devices using this type
        if ($deviceType->devices()->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => __('device_types.cannot_delete_in_use')
            ], 422);
        }

        try {
            $deviceType->delete();

            return response()->json([
                'status' => 'success',
                'message' => __('device_types.deleted_successfully')
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => __('device_types.deletion_failed'),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ====================================
    // Device Type Related Operations
    // ====================================

    /**
     * Get devices by type
     */
    public function getDevices(string $typeId): JsonResponse
    {
        $deviceType = DeviceType::find($typeId);

        if (!$deviceType) {
            return response()->json([
                'status' => 'error',
                'message' => __('device_types.not_found')
            ], 404);
        }

        $devices = $deviceType->devices()->with('description')->get();

        return response()->json([
            'status' => 'success',
            'device_type' => $deviceType->name,
            'devices' => DeviceResource::collection($devices),
        ]);
    }

    /**
     * Get capabilities for a specific device
     */
    public function getDeviceCapabilities(string $deviceId): JsonResponse
    {
        $device = Device::with('type')->find($deviceId);

        if (!$device) {
            return response()->json([
                'status' => 'error',
                'message' => __('devices.not_found')
            ], 404);
        }

        if (!$device->type) {
            return response()->json([
                'status' => 'error',
                'message' => __('devices.no_type_assigned')
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'device_id' => $device->id,
            'device_type' => $device->type->name,
            'capabilities' => $device->type->capabilities,
        ]);
    }

    // ====================================
    // MQTT Topic Management
    // ====================================

    /**
     * Get all automation MQTT subscribe topics
     */
    public function getAutomationTopics(): JsonResponse
    {
        $topics = $this->mqttTopicService->getAutomationSubscribeTopics();

        return response()->json([
            'success' => true,
            'data' => $topics
        ]);
    }

    /**
     * Get MQTT topics for a specific device type
     */
    public function getMqttTopics(string $deviceTypeId): JsonResponse
    {
        $topicConfig = $this->mqttTopicService->getAutomationSubscribeTopicsForDeviceType($deviceTypeId);

        if (!$topicConfig) {
            return response()->json([
                'success' => false,
                'message' => 'Device type not found or automation not configured'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $topicConfig
        ]);
    }

    /**
     * Get devices with their MQTT topics for a specific device type
     */
    public function getDevicesWithTopics(string $deviceTypeId): JsonResponse
    {
        $devices = $this->mqttTopicService->getDevicesWithAutomationTopicsForDeviceType($deviceTypeId);

        return response()->json([
            'success' => true,
            'data' => $devices
        ]);
    }

    /**
     * Get all automation-enabled device types
     */
    public function getAutomationEnabledDeviceTypes(): JsonResponse
    {
        $deviceTypes = $this->mqttTopicService->getAutomationEnabledDeviceTypes();

        return response()->json([
            'success' => true,
            'data' => $deviceTypes->map(function (DeviceType $deviceType) {
                return [
                    'id' => $deviceType->id,
                    'name' => $deviceType->name,
                    'description' => $deviceType->description,
                    'automation_topics' => [
                        'subscribe' => $deviceType->getAutomationSubscribeTopic(),
                        'command' => $deviceType->getAutomationCommandTopic()
                    ]
                ];
            })
        ]);
    }

    /**
     * Validate MQTT topic configuration
     */
    public function validateMqttConfiguration(Request $request): JsonResponse
    {
        $request->validate([
            'mqtt_topics' => 'required|array'
        ]);

        $errors = $this->mqttTopicService->validateMqttTopicConfiguration($request->mqtt_topics);

        return response()->json([
            'success' => empty($errors),
            'errors' => $errors
        ]);
    }
}