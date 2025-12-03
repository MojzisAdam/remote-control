<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Lang;
use App\Services\ErrorNotificationService;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use App\Models\DeviceNotification;
use App\Models\NotificationType;
use App\Models\User;

class NotificationController extends Controller
{
    protected $errorNotificationService;

    public function __construct(ErrorNotificationService $errorNotificationService)
    {
        $this->errorNotificationService = $errorNotificationService;
    }

    public function notifyDeviceError(Request $request)
    {
        $validated = $request->validate([
            'device_id' => 'required|string|exists:devices,id',
            'error_code' => 'required|integer',
        ]);

        $deviceId = $validated['device_id'];
        $newErrorCode = $validated['error_code'];

        try {
            $this->errorNotificationService->processErrorTransition($deviceId, $newErrorCode);
            return response()->json(['message' => 'Notification processed successfully.']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to process notification.',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function notifyAutomation(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string|max:1000',
            'user_id' => 'required|integer|exists:users,id',
        ]);

        // Create the automation notification
        $notification = Notification::create([
            'title' => $validated['title'],
            'body' => $validated['body'],
            'notification_type_id' => NotificationType::AUTOMATION,
        ]);

        // Attach the notification to the specified user
        $notification->users()->attach($validated['user_id'], [
            'seen' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Automation notification sent successfully.'
        ]);
    }


    public function getUserNotifications(Request $request)
    {
        $user = Auth::user();

        $notifications = $user->notifications()
            ->with(['notificationType', 'deviceNotification.device'])
            ->orderBy('notifications.created_at', 'desc')
            ->limit(100)
            ->get();

        $notifications = $notifications->map(function ($notification) use ($user) {
            // Handle device notifications
            if ($notification->deviceNotification) {
                $deviceNotification = $notification->deviceNotification;

                if ($deviceNotification->message_key && Lang::has($deviceNotification->message_key, $user->preferred_language)) {
                    $data = json_decode($deviceNotification->message_data, true);
                    $notification->message = __($deviceNotification->message_key, $data);
                } else {
                    $notification->message = $deviceNotification->message ?: $notification->body;
                }

                // Add device-specific properties
                $notification->device_id = $deviceNotification->device_id;
                $notification->error_code = $deviceNotification->error_code;

                // Add the own_name from the user_devices pivot table
                $userDevice = $user->devices()->where('device_id', $deviceNotification->device_id)->first();
                if ($userDevice) {
                    $notification->own_name = $userDevice->pivot->own_name;
                }
            } else {
                // For non-device notifications, use the base notification body
                $notification->message = $notification->body;
            }

            if ($notification->notificationType) {
                $notification->type = [
                    'id' => $notification->notificationType->id,
                    'name' => $notification->notificationType->name,
                    'description' => $notification->notificationType->description,
                ];
            }

            $notification->seen = $notification->pivot->seen;
            unset($notification->pivot);
            return $notification;
        });

        return response()->json(NotificationResource::collection($notifications));
    }

    public function markNotificationAsSeen(Request $request, $notificationId)
    {
        $user = Auth::user();

        $notification = $user->notifications()
            ->with(['notificationType', 'deviceNotification.device'])
            ->where('notifications.id', $notificationId)
            ->first();

        if (!$notification) {
            return response()->json(['error' => 'Notification not found'], 404);
        }

        $user->notifications()->updateExistingPivot($notificationId, ['seen' => true]);

        // Refresh the notification to get updated pivot data
        $notification = $user->notifications()
            ->with(['notificationType', 'deviceNotification.device'])
            ->where('notifications.id', $notificationId)
            ->first();

        // Add device-specific data if it's a device notification
        if ($notification->deviceNotification) {
            $deviceNotification = $notification->deviceNotification;
            $notification->device_id = $deviceNotification->device_id;
            $notification->error_code = $deviceNotification->error_code;

            // Add the own_name from the user_devices pivot table
            $userDevice = $user->devices()->where('device_id', $deviceNotification->device_id)->first();
            if ($userDevice) {
                $notification->own_name = $userDevice->pivot->own_name;
            }
        }

        $notification->seen = $notification->pivot->seen;
        unset($notification->pivot);

        return response()->json(new NotificationResource($notification));
    }

    public function markAllNotificationsAsSeen(Request $request)
    {
        $user = Auth::user();
        $limit = $request->input('limit', 100);

        // Get unseen notification IDs limited by the parameter
        $notificationIds = $user->notifications()
            ->wherePivot('seen', false)
            ->orderBy('notifications.created_at', 'desc')
            ->limit($limit)
            ->pluck('notifications.id');

        // Update all notifications at once
        foreach ($notificationIds as $id) {
            $user->notifications()->updateExistingPivot($id, ['seen' => true]);
        }

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as seen',
            'count' => count($notificationIds)
        ]);
    }

    public function markDeviceNotificationsAsSeen(Request $request, $deviceId)
    {
        $user = Auth::user();

        // Get all unseen notification IDs for this device
        $notificationIds = $user->notifications()
            ->whereHas('deviceNotification', function ($query) use ($deviceId) {
                $query->where('device_id', $deviceId);
            })
            ->wherePivot('seen', false)
            ->pluck('notifications.id');

        // Update all notifications at once
        foreach ($notificationIds as $id) {
            $user->notifications()->updateExistingPivot($id, ['seen' => true]);
        }

        return response()->json([
            'success' => true,
            'message' => 'All device notifications marked as seen',
            'count' => count($notificationIds)
        ]);
    }

    public function getUnseenNotifications(Request $request)
    {
        $user = Auth::user();
        $notifications = $user->notifications()
            ->with(['notificationType', 'deviceNotification.device'])
            ->wherePivot('seen', false)
            ->orderBy('notifications.created_at', 'desc')
            ->limit(100)
            ->get();

        $notifications = $notifications->map(function ($notification) use ($user) {
            // Handle device notifications
            if ($notification->deviceNotification) {
                $deviceNotification = $notification->deviceNotification;

                if ($deviceNotification->message_key && Lang::has($deviceNotification->message_key, $user->preferred_language)) {
                    $data = json_decode($deviceNotification->message_data, true);
                    $notification->message = __($deviceNotification->message_key, $data);
                } else {
                    $notification->message = $deviceNotification->message ?: $notification->body;
                }

                // Add device-specific properties
                $notification->device_id = $deviceNotification->device_id;
                $notification->error_code = $deviceNotification->error_code;

                // Add the own_name from the user_devices pivot table
                $userDevice = $user->devices()->where('device_id', $deviceNotification->device_id)->first();
                if ($userDevice) {
                    $notification->own_name = $userDevice->pivot->own_name;
                }
            } else {
                // For non-device notifications, use the base notification body
                $notification->message = $notification->body;
            }

            if ($notification->notificationType) {
                $notification->type = [
                    'id' => $notification->notificationType->id,
                    'name' => $notification->notificationType->name,
                    'description' => $notification->notificationType->description,
                ];
            }

            $notification->seen = $notification->pivot->seen;
            unset($notification->pivot);
            return $notification;
        });

        return response()->json(NotificationResource::collection($notifications));
    }
    public function getDeviceNotifications(Request $request, $deviceId)
    {
        $user = Auth::user();
        $page = $request->input('page', 1);
        $limit = $request->input('limit', 20);
        $offset = ($page - 1) * $limit;

        $notifications = $user->notifications()
            ->with(['notificationType', 'deviceNotification.device'])
            ->whereHas('deviceNotification', function ($query) use ($deviceId) {
                $query->where('device_id', $deviceId);
            })
            ->orderBy('notifications.created_at', 'desc')
            ->skip($offset)
            ->take($limit)
            ->get();

        $total = $user->notifications()
            ->whereHas('deviceNotification', function ($query) use ($deviceId) {
                $query->where('device_id', $deviceId);
            })
            ->count();

        $notifications = $notifications->map(function ($notification) use ($user) {
            $deviceNotification = $notification->deviceNotification;

            // Handle localized messages
            if ($deviceNotification->message_key && Lang::has($deviceNotification->message_key, $user->preferred_language)) {
                $data = json_decode($deviceNotification->message_data, true);
                $notification->message = __($deviceNotification->message_key, $data);
            } else {
                $notification->message = $deviceNotification->message ?: $notification->body;
            }

            // Add device-specific properties
            $notification->device_id = $deviceNotification->device_id;
            $notification->error_code = $deviceNotification->error_code;

            // Add the own_name from the user_devices pivot table
            $userDevice = $user->devices()->where('device_id', $deviceNotification->device_id)->first();
            if ($userDevice) {
                $notification->own_name = $userDevice->pivot->own_name;
            }

            if ($notification->notificationType) {
                $notification->type = [
                    'id' => $notification->notificationType->id,
                    'name' => $notification->notificationType->name,
                    'description' => $notification->notificationType->description,
                ];
            }

            $notification->seen = $notification->pivot->seen;
            unset($notification->pivot);
            return $notification;
        });

        return response()->json([
            'notifications' => NotificationResource::collection($notifications),
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'hasMore' => $offset + $limit < $total
            ]
        ]);
    }
}