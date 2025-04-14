<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserCustomGraphResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'deviceId' => $this->device_id,
            'graphName' => $this->graph_name,
            'selectedMetrics' => json_decode($this->selected_metrics),
        ];
    }
}
