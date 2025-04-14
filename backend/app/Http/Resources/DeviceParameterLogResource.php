<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeviceParameterLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'device_id' => $this->device_id,
            'user_id' => $this->user_id,
            'email' => $this->email,
            'parameter' => $this->parameter,
            'old_value' => $this->old_value,
            'new_value' => $this->new_value,
            'changed_at' => $this->changed_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}