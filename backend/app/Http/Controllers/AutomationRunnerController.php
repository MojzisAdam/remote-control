<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Automation;
use App\Models\AutomationLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class AutomationRunnerController extends Controller
{
    /**
     * Get all active automations for the runner to process
     */
    public function getActiveAutomations(): JsonResponse
    {
        $automations = Automation::enabled()
            ->with(['triggers', 'conditions', 'actions', 'user:id,email'])
            ->get()
            ->map(function ($automation) {
                // Get all execution paths for path-aware execution
                $executionPaths = [];
                $flowValid = false;
                $validationErrors = [];

                try {
                    // Validate flow first
                    $validationErrors = $automation->validateFlow();
                    $flowValid = empty($validationErrors);

                    if ($flowValid) {
                        $allPaths = $automation->getAllExecutionPaths();
                        foreach ($allPaths as $triggerNodeId => $pathData) {
                            $executionPaths[$triggerNodeId] = [
                                'trigger' => $pathData['trigger'] ? [
                                    'id' => $pathData['trigger']->id,
                                    'type' => $pathData['trigger']->type,
                                    'time_at' => $pathData['trigger']->time_at?->format('H:i'),
                                    'days_of_week' => $pathData['trigger']->days_of_week,
                                    'interval_seconds' => $pathData['trigger']->interval_seconds,
                                    'mqtt_topic' => $pathData['trigger']->mqtt_topic,
                                    'mqtt_payload' => $pathData['trigger']->mqtt_payload,
                                    'device_id' => $pathData['trigger']->device_id,
                                    'field' => $pathData['trigger']->field,
                                    'operator' => $pathData['trigger']->operator,
                                    'value' => $pathData['trigger']->value,
                                ] : null,
                                'conditions' => $pathData['conditions']->map(function ($condition) {
                                    return [
                                        'id' => $condition->id,
                                        'type' => $condition->type,
                                        'device_id' => $condition->device_id,
                                        'field' => $condition->field,
                                        'operator' => $condition->operator,
                                        'value' => $condition->value,
                                        'time_at' => $condition->time_at?->format('H:i'),
                                        'days_of_week' => $condition->days_of_week,
                                    ];
                                })->toArray(),
                                'actions' => $pathData['actions']->map(function ($action) {
                                    return [
                                        'id' => $action->id,
                                        'type' => $action->type,
                                        'mqtt_topic' => $action->mqtt_topic,
                                        'mqtt_payload' => $action->mqtt_payload,
                                        'device_id' => $action->device_id,
                                        'field' => $action->field,
                                        'value' => $action->value,
                                        'notification_title' => $action->notification_title,
                                        'notification_message' => $action->notification_message,
                                    ];
                                })->toArray(),
                                'path_nodes' => $pathData['path'],
                            ];
                        }
                    }
                } catch (\Exception $e) {
                    logger()->error("Failed to parse execution paths for automation {$automation->id}: " . $e->getMessage());
                    $validationErrors[] = 'Failed to parse execution paths: ' . $e->getMessage();
                }

                return [
                    'id' => $automation->id,
                    'name' => $automation->name,
                    'user_id' => $automation->user_id,
                    'user_email' => $automation->user->email,
                    'flow_metadata' => $automation->flow_metadata,
                    'flow_valid' => $flowValid,
                    'validation_errors' => $validationErrors,
                    'execution_paths' => $executionPaths,
                ];
            });

        return response()->json([
            'automations' => $automations,
            'timestamp' => now()->toISOString(),
            'count' => $automations->count(),
        ]);
    }

    /**
     * Log automation execution result from the runner
     */
    public function logExecution(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'automation_id' => 'required|integer|exists:automations,id',
            'status' => 'required|in:success,failed,skipped,partial,warning',
            'details' => 'nullable|string|max:1000',
            'executed_at' => 'nullable|date',
        ]);

        try {
            $log = AutomationLog::create([
                'automation_id' => $validated['automation_id'],
                'executed_at' => $validated['executed_at'] ?? now(),
                'status' => $validated['status'],
                'details' => $validated['details'],
            ]);

            return response()->json([
                'message' => 'Execution logged successfully',
                'log_id' => $log->id,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to log automation execution', [
                'automation_id' => $validated['automation_id'],
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to log execution',
            ], 500);
        }
    }

    /**
     * Log multiple automation executions in batch
     */
    public function logBatchExecution(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'executions' => 'required|array|max:100',
            'executions.*.automation_id' => 'required|integer|exists:automations,id',
            'executions.*.status' => 'required|in:success,failed,skipped,partial,warning',
            'executions.*.details' => 'nullable|string|max:1000',
            'executions.*.executed_at' => 'nullable|date',
        ]);

        $logsCreated = 0;
        $errors = [];

        foreach ($validated['executions'] as $index => $execution) {
            try {
                AutomationLog::create([
                    'automation_id' => $execution['automation_id'],
                    'executed_at' => $execution['executed_at'] ?? now(),
                    'status' => $execution['status'],
                    'details' => $execution['details'] ?? null,
                ]);
                $logsCreated++;
            } catch (\Exception $e) {
                $errors[] = [
                    'index' => $index,
                    'automation_id' => $execution['automation_id'],
                    'error' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'message' => 'Batch execution logged',
            'successful' => $logsCreated,
            'failed' => count($errors),
            'errors' => $errors,
        ]);
    }

    /**
     * Get comprehensive device information for automation runner
     */
    public function getDevicesData(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'device_ids' => 'required|array',
            'device_ids.*' => 'string|exists:devices,id',
        ]);

        $devices = \App\Models\Device::with(['type', 'data', 'description'])
            ->whereIn('id', $validated['device_ids'])
            ->get()
            ->map(function ($device) {
                return [
                    'id' => $device->id,
                    'device_id' => $device->id,
                    'device_type_id' => $device->device_type_id,
                    'display_type' => $device->display_type,
                    'ip' => $device->ip,
                    'last_activity' => $device->last_activity?->toISOString(),
                    'online' => $device->last_activity && $device->last_activity->diffInMinutes() < 5,
                    'error_code' => $device->error_code,
                    'script_version' => $device->script_version,
                    'fw_version' => $device->fw_version,
                ];
            });

        return response()->json([
            'devices' => $devices,
            'timestamp' => now()->toISOString(),
            'count' => $devices->count(),
        ]);
    }

    /**
     * Health check endpoint for the runner
     */
    public function health(): JsonResponse
    {
        try {
            // Simple database connectivity check
            // DB::connection()->getPdo();

            return response()->json([
                'status' => 'ok',
                'timestamp' => now()->toISOString(),
                'service' => 'automation-runner-api'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'error' => 'Database connection failed',
                'timestamp' => now()->toISOString(),
                'service' => 'automation-runner-api'
            ], 500);
        }
    }
}