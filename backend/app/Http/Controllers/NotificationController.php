<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Lang;
use App\Services\ErrorNotificationService;
use App\Http\Resources\NotificationResource;

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

        $this->errorNotificationService->processErrorTransition($deviceId, $newErrorCode);

        return response()->json(['message' => 'Notification processed.']);
    }


    public function getUserNotifications(Request $request)
    {
        $user = Auth::user();

        $notifications = $user->notifications()
            ->orderBy('device_notifications.created_at', 'desc')
            ->limit(100)
            ->get();

        $notifications = $notifications->map(function ($notification) use ($user) {
            if ($notification->message_key && Lang::has($notification->message_key, $user->preferred_language)) {
                $data = json_decode($notification->message_data, true);
                $notification->message = __($notification->message_key, $data);
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

        return response()->json(notificationResource::collection($notifications));
        ;
    }

    public function markNotificationAsSeen(Request $request, $notificationId)
    {
        $user = Auth::user();

        $notification = $user->notifications()->where('device_notifications.id', $notificationId)->first();

        if (!$notification) {
            return response()->json(['error' => 'Notification not found'], 404);
        }

        $user->notifications()->updateExistingPivot($notificationId, ['seen' => true]);

        $notification = $user->notifications()->where('device_notifications.id', $notificationId)->first();

        $notification->seen = $notification->pivot->seen;
        unset($notification->pivot);

        return response()->json(new NotificationResource($notification));
    }

    public function getUnseenNotifications(Request $request)
    {
        $user = Auth::user();

        $notifications = $user->notifications()
            ->wherePivot('seen', false)
            ->orderBy('device_notifications.created_at', 'desc')
            ->limit(100)
            ->get();

        $notifications = $notifications->map(function ($notification) use ($user) {
            if ($notification->message_key && Lang::has($notification->message_key, $user->preferred_language)) {
                $data = json_decode($notification->message_data, true);
                $notification->message = __($notification->message_key, $data);
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

        return response()->json(notificationResource::collection($notifications));
    }

    public function getDeviceNotifications(Request $request, $deviceId)
    {
        $user = Auth::user();
        $page = $request->input('page', 1);
        $limit = $request->input('limit', 20);
        $offset = ($page - 1) * $limit;

        $notifications = $user->notifications()
            ->where('device_notifications.device_id', $deviceId)
            ->orderBy('device_notifications.created_at', 'desc')
            ->skip($offset)
            ->take($limit)
            ->get();

        $total = $user->notifications()
            ->where('device_notifications.device_id', $deviceId)
            ->count();

        $notifications = $notifications->map(function ($notification) use ($user) {
            if ($notification->message_key && Lang::has($notification->message_key, $user->preferred_language)) {
                $data = json_decode($notification->message_data, true);
                $notification->message = __($notification->message_key, $data);
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