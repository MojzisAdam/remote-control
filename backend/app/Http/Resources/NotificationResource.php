<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'device_id' => $this->device_id,
            'error_code' => $this->error_code,
            'message' => $this->message,
            'seen' => $this->seen ?? false,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'additional_data' => optional($this->message_data)->isEmpty() ? null : json_encode($this->message_data),
        ];
    }
}