<?php

namespace App\Services;

use App\Models\DeviceErrorState;
use App\Models\DeviceNotification;
use Illuminate\Support\Facades\Mail;
use App\Mail\NewErrorOccurredMail;
use App\Mail\ErrorResolvedMail;
use App\Models\Device;
use Illuminate\Support\Facades\Log;

class ErrorNotificationService
{
    public function processErrorTransition($deviceId, $newErrorCode)
    {
        $newErrorCode = (int) $newErrorCode;

        $state = DeviceErrorState::firstOrNew(['device_id' => $deviceId]);
        $lastErrorCode = (int) ($state->current_error_code ?? 0);

        if ($newErrorCode === $lastErrorCode) {
            return;
        }

        if ($lastErrorCode === 0 && $newErrorCode > 0) {
            $this->sendNewErrorEmail($deviceId, $newErrorCode);
        } elseif ($lastErrorCode > 0 && $newErrorCode > 0 && $lastErrorCode !== $newErrorCode) {
            $this->sendNewErrorEmail($deviceId, $newErrorCode);
        } elseif ($lastErrorCode > 0 && $newErrorCode === 0) {
            $this->sendErrorResolvedEmail($deviceId);
        }
        $state->current_error_code = $newErrorCode;
        $state->save();

        if ($newErrorCode > 0 && $newErrorCode != $lastErrorCode) {
            $notification = DeviceNotification::create([
                'device_id' => $deviceId,
                'error_code' => $newErrorCode,
                'message' => 'An error occurred with code ' . $newErrorCode,
                'message_key' => 'notifications.error_occurred',
                'message_data' => json_encode(['error_code' => $newErrorCode]),
                'notification_type_id' => 1
            ]);

            $this->attachNotificationToUsers($notification, $deviceId);
        }

        if ($newErrorCode === 0 && $lastErrorCode > 0) {
            $notification = DeviceNotification::create([
                'device_id' => $deviceId,
                'error_code' => 0,
                'message' => 'Error resolved: all issues have been resolved.',
                'message_key' => 'notifications.error_resolved',
                'message_data' => json_encode([]),
                'notification_type_id' => 2
            ]);

            $this->attachNotificationToUsers($notification, $deviceId);
        }
    }
    private function attachNotificationToUsers($notification, $deviceId)
    {
        // Get device with its users who have web notifications enabled
        $device = Device::findOrFail($deviceId);
        $users = $device->users()->wherePivot('web_notifications', true)->get();

        foreach ($users as $user) {
            // Check if the user already has this notification
            if (!$notification->users()->where('users.id', $user->id)->exists()) {
                // Attach the notification to the user
                $notification->users()->attach($user->id, [
                    'seen' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    protected function sendNewErrorEmail($deviceId, $errorCode)
    {
        $device = Device::with([
            'users' => function ($query) {
                $query->wherePivot('notifications', true);
            }
        ])->find($deviceId);

        foreach ($device->users as $user) {
            $ownName = $user->pivot->own_name;
            Mail::to(['email' => $user->email])
                ->locale($user->preferred_language ?? 'cs')
                ->send(new NewErrorOccurredMail($deviceId, $errorCode, $ownName));
        }
    }

    protected function sendErrorResolvedEmail($deviceId)
    {
        $device = Device::with([
            'users' => function ($query) {
                $query->wherePivot('notifications', true);
            }
        ])->find($deviceId);

        foreach ($device->users as $user) {
            $ownName = $user->pivot->own_name;
            Mail::to(['email' => $user->email])
                ->locale($user->preferred_language ?? 'cs')
                ->send(new ErrorResolvedMail($deviceId, $ownName));
        }
    }
}