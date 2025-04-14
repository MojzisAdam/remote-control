<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;

class DeviceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $userDevice = $this->users->firstWhere('id', Auth::id());

        return [
            'id' => $this->id,
            'ip' => $this->ip,
            'display_type' => $this->display_type,
            'script_version' => $this->script_version,
            'fw_version' => $this->fw_version,
            'last_activity' => $this->last_activity,
            'history_writing_interval' => $this->history_writing_interval,
            'send_data' => $this->send_data,
            'send_data_until' => $this->send_data_until,
            'error_code' => $this->error_code,
            'created_at' => $this->created_at,

            'description' => $this->description,
            'own_name' => $userDevice ? $userDevice->pivot->own_name : null,
            'favourite' => $userDevice ? $userDevice->pivot->favourite : false,
            'notifications' => $userDevice ? $userDevice->pivot->notifications : false,
            'favouriteOrder' => $userDevice ? $userDevice->pivot->favouriteOrder : 0,
        ];
    }
}