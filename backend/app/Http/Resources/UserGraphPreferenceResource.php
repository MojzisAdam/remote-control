<?php


namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserGraphPreferenceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'deviceId' => $this->device_id,
            'hiddenLines' => $this->hidden_lines,
        ];
    }
}