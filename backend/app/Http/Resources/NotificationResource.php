<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'title' => $this->title,
            'message' => $this->message ?? $this->body,
            'seen' => $this->seen ?? false,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'type' => $this->when($this->relationLoaded('notificationType') && $this->notificationType, [
                'id' => $this->notificationType?->id,
                'name' => $this->notificationType?->name,
                'description' => $this->notificationType?->description,
            ]),
        ];

        // Add device-specific fields if this is a device notification
        if ($this->deviceNotification || isset($this->device_id)) {
            $data['device_id'] = $this->device_id;
            $data['error_code'] = $this->error_code;
            $data['own_name'] = $this->own_name ?? null;

            // Add additional device notification data
            if ($this->deviceNotification) {
                $deviceNotification = $this->deviceNotification;
                $data['additional_data'] = $deviceNotification->message_data ?
                    json_encode($deviceNotification->message_data) : null;
            }
        }

        return $data;
    }
}