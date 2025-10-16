<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AutomationResource extends JsonResource
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
            'name' => $this->name,
            'description' => $this->description,
            'enabled' => $this->enabled,
            'is_draft' => $this->is_draft,
            'flow_metadata' => $this->flow_metadata,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            // Include relationships when loaded
            'triggers' => $this->whenLoaded('triggers', function () {
                return $this->triggers->map(function ($trigger) {
                    return [
                        'id' => $trigger->id,
                        'type' => $trigger->type,
                        'time_at' => $trigger->time_at ? substr($trigger->time_at, 0, 5) : null, // Format as HH:MM
                        'days_of_week' => $trigger->days_of_week,
                        'interval_seconds' => $trigger->interval_seconds,
                        'mqtt_topic' => $trigger->mqtt_topic,
                        'mqtt_payload' => $trigger->mqtt_payload,
                        'device_id' => $trigger->device_id,
                        'field' => $trigger->field,
                        'operator' => $trigger->operator,
                        'value' => $trigger->value,
                    ];
                });
            }),

            'conditions' => $this->whenLoaded('conditions', function () {
                return $this->conditions->map(function ($condition) {
                    return [
                        'id' => $condition->id,
                        'type' => $condition->type,
                        'device_id' => $condition->device_id,
                        'field' => $condition->field,
                        'operator' => $condition->operator,
                        'operator_text' => $condition->operator_text,
                        'value' => $condition->value,
                        'time_at' => $condition->time_at ? substr($condition->time_at, 0, 5) : null, // Format as HH:MM
                        'days_of_week' => $condition->days_of_week,
                    ];
                });
            }),

            'actions' => $this->whenLoaded('actions', function () {
                return $this->actions->map(function ($action) {
                    return [
                        'id' => $action->id,
                        'type' => $action->type,
                        'mqtt_topic' => $action->mqtt_topic,
                        'mqtt_payload' => $action->mqtt_payload,
                        'device_id' => $action->device_id,
                        'field' => $action->field,
                        'value' => $action->value,
                        'notification_title' => $action->notification_title,
                        'notification_message' => $action->notification_message
                    ];
                });
            }),

            'recent_logs' => $this->whenLoaded('logs', function () {
                return AutomationLogResource::collection($this->logs);
            }),

            // Summary statistics
            'stats' => $this->when($this->relationLoaded('logs'), function () {
                return [
                    'total_executions' => $this->logs->count(),
                    'successful_executions' => $this->logs->where('status', 'success')->count(),
                    'failed_executions' => $this->logs->where('status', 'failed')->count(),
                    'last_execution' => $this->logs->first()?->executed_at?->toISOString(),
                ];
            }),
        ];
    }
}