<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AutomationLogResource extends JsonResource
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
            'automation_id' => $this->automation_id,
            'executed_at' => $this->executed_at?->toISOString(),
            'status' => $this->status,
            'details' => $this->details,
            'is_successful' => $this->isSuccessful(),
            'is_failed' => $this->isFailed(),
            'is_skipped' => $this->isSkipped(),
            'is_partial' => $this->isPartial(),
            'is_warning' => $this->isWarning(),
            'is_problematic' => $this->isProblematic(),
            'was_not_executed' => $this->wasNotExecuted(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            // Human-readable status
            'status_text' => match ($this->status) {
                'success' => 'Success',
                'failed' => 'Failed',
                'skipped' => 'Skipped',
                'partial' => 'Partial',
                'warning' => 'Warning',
                default => 'Unknown',
            },

            // Status description
            'status_description' => $this->getStatusDescription(),

            // Execution duration from creation if available
            'execution_time' => $this->when(
                $this->created_at && $this->executed_at,
                fn() => $this->executed_at->diffInSeconds($this->created_at) . 's'
            ),
        ];
    }
}