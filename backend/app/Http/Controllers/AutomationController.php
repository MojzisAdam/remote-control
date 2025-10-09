<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAutomationRequest;
use App\Http\Requests\UpdateAutomationRequest;
use App\Http\Resources\AutomationResource;
use App\Http\Resources\AutomationLogResource;
use App\Models\Automation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class AutomationController extends Controller
{
    /**
     * Display a listing of the user's automations
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $automationsQuery = Automation::where('user_id', $user->id)
            ->with([
                'triggers',
                'conditions',
                'actions',
                'logs' => function ($query) {
                    $query->latest('executed_at')->limit(1);
                }
            ]);

        // Apply search filter
        if ($request->has('search') && $request->input('search')) {
            $search = $request->input('search');
            $automationsQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        // Apply enabled filter
        if ($request->has('enabled')) {
            $automationsQuery->where('enabled', $request->boolean('enabled'));
        }

        $perPage = $request->input('per_page', 15);
        $perPage = min(max($perPage, 1), 50);

        $automations = $automationsQuery->orderBy('created_at', 'desc')->paginate($perPage);

        return AutomationResource::collection($automations);
    }

    /**
     * Get automation statistics for the user
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Automation::where('user_id', $user->id);

        $total = $query->count();
        $enabled = (clone $query)->where('enabled', true)->count();
        $disabled = $total - $enabled;

        // Count automations with errors (last execution failed)
        $withErrors = (clone $query)->whereHas('logs', function ($q) {
            $q->whereIn('id', function ($subQuery) {
                $subQuery->selectRaw('MAX(id)')
                    ->from('automation_logs')
                    ->groupBy('automation_id');
            })
                ->where('status', 'failed');
        })->count();

        return response()->json([
            'total' => $total,
            'enabled' => $enabled,
            'disabled' => $disabled,
            'withErrors' => $withErrors,
        ]);
    }

    /**
     * Store a newly created automation
     */
    public function store(StoreAutomationRequest $request)
    {
        \Log::info('Automation store request data:', $request->all());

        $user = $request->user();
        $validated = $request->validated();

        // Verify user has access to all referenced devices
        $deviceIds = collect($validated['conditions'] ?? [])
            ->pluck('device_id')
            ->merge(collect($validated['actions'] ?? [])->pluck('device_id'))
            ->merge(collect($validated['triggers'] ?? [])->pluck('device_id'))
            ->filter()
            ->unique();

        $userDeviceIds = $user->devices()->pluck('devices.id');
        if ($deviceIds->diff($userDeviceIds)->isNotEmpty()) {
            return response()->json(['error' => 'You do not have access to one or more specified devices'], 403);
        }

        DB::beginTransaction();
        try {
            // Create the automation
            $automation = Automation::create([
                'user_id' => $user->id,
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'enabled' => $validated['enabled'] ?? true,
                'is_draft' => $validated['is_draft'] ?? false,
                'flow_metadata' => $validated['flow_metadata'] ?? null,
            ]);

            // Create triggers and collect their IDs for flow metadata update
            $createdTriggerIds = [];
            foreach ($validated['triggers'] ?? [] as $triggerData) {
                $trigger = $automation->triggers()->create($triggerData);
                $createdTriggerIds[] = $trigger->id;
            }

            // Create conditions and collect their IDs
            $createdConditionIds = [];
            foreach ($validated['conditions'] ?? [] as $conditionData) {
                $condition = $automation->conditions()->create($conditionData);
                $createdConditionIds[] = $condition->id;
            }

            // Create actions and collect their IDs
            $createdActionIds = [];
            foreach ($validated['actions'] ?? [] as $actionData) {
                $action = $automation->actions()->create($actionData);
                $createdActionIds[] = $action->id;
            }

            // Update flow metadata with actual database IDs
            if (isset($validated['flow_metadata'])) {
                $updatedFlowMetadata = $this->updateFlowMetadataWithEntityIds(
                    $validated['flow_metadata'],
                    $createdTriggerIds,
                    $createdConditionIds,
                    $createdActionIds
                );
                $automation->update(['flow_metadata' => $updatedFlowMetadata]);
            }

            DB::commit();

            $automation->load(['triggers', 'conditions', 'actions']);

            return (new AutomationResource($automation))->response()->setStatusCode(201);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['error' => 'Failed to create automation: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified automation
     */
    public function show(Request $request, Automation $automation)
    {
        Gate::authorize('view', $automation);

        $automation->load([
            'triggers',
            'conditions',
            'actions',
            'logs' => function ($query) {
                $query->latest('executed_at')->limit(10);
            }
        ]);

        return new AutomationResource($automation);
    }

    /**
     * Update the specified automation
     */
    public function update(UpdateAutomationRequest $request, Automation $automation)
    {
        Gate::authorize('update', $automation);

        $user = Auth::user();
        $validated = $request->validated();

        // Verify user has access to all referenced devices
        $deviceIds = collect($validated['conditions'] ?? [])
            ->pluck('device_id')
            ->merge(collect($validated['actions'] ?? [])->pluck('device_id'))
            ->merge(collect($validated['triggers'] ?? [])->pluck('device_id'))
            ->filter()
            ->unique();

        $userDeviceIds = $user->devices()->pluck('devices.id');
        if ($deviceIds->diff($userDeviceIds)->isNotEmpty()) {
            return response()->json(['error' => 'You do not have access to one or more specified devices'], 403);
        }

        DB::beginTransaction();
        try {
            // Update basic automation info
            $automation->update(array_intersect_key($validated, [
                'name' => true,
                'description' => true,
                'enabled' => true,
                'is_draft' => true,
                'flow_metadata' => true,
            ]));

            // Update triggers with proper entity management
            if (isset($validated['triggers'])) {
                $this->syncAutomationEntities(
                    $automation->triggers(),
                    $validated['triggers']
                );
            }

            // Update conditions with proper entity management
            if (isset($validated['conditions'])) {
                $this->syncAutomationEntities(
                    $automation->conditions(),
                    $validated['conditions']
                );
            }

            // Update actions with proper entity management  
            if (isset($validated['actions'])) {
                $this->syncAutomationEntities(
                    $automation->actions(),
                    $validated['actions']
                );
            }

            // Reload to get current entity IDs
            $automation->load(['triggers', 'conditions', 'actions']);

            // Update flow metadata with actual entity IDs if provided
            if (isset($validated['flow_metadata'])) {
                $triggerIds = $automation->triggers->pluck('id')->toArray();
                $conditionIds = $automation->conditions->pluck('id')->toArray();
                $actionIds = $automation->actions->pluck('id')->toArray();

                $updatedFlowMetadata = $this->updateFlowMetadataWithEntityIds(
                    $validated['flow_metadata'],
                    $triggerIds,
                    $conditionIds,
                    $actionIds
                );

                $automation->update(['flow_metadata' => $updatedFlowMetadata]);
            }

            DB::commit();

            return new AutomationResource($automation);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['error' => 'Failed to update automation: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Properly sync automation entities (triggers/conditions/actions)
     * Updates existing, creates new, deletes removed - preserves IDs
     */
    private function syncAutomationEntities($relation, array $newEntityData)
    {
        $existingEntities = $relation->get()->keyBy('id');

        // Track which entities we've processed
        $processedIds = collect();

        foreach ($newEntityData as $entityData) {
            if (isset($entityData['id']) && $existingEntities->has($entityData['id'])) {
                // Update existing entity
                $existingEntity = $existingEntities->get($entityData['id']);
                $updateData = collect($entityData)->except(['id'])->toArray();
                $existingEntity->update($updateData);
                $processedIds->push($entityData['id']);
            } else {
                // Create new entity (no ID or ID doesn't exist)
                $createData = collect($entityData)->except(['id'])->toArray();
                $newEntity = $relation->create($createData);
                $processedIds->push($newEntity->id);
            }
        }

        // Delete entities that weren't in the submitted data
        $idsToDelete = $existingEntities->keys()->diff($processedIds);
        if ($idsToDelete->isNotEmpty()) {
            $relation->whereIn('id', $idsToDelete)->delete();
        }
    }

    /**
     * Update flow metadata with actual database entity IDs
     * This ensures node IDs match database IDs for reliable mapping
     */
    private function updateFlowMetadataWithEntityIds($flowMetadata, $triggerIds, $conditionIds, $actionIds)
    {
        if (!is_array($flowMetadata) || !isset($flowMetadata['nodes'])) {
            return $flowMetadata;
        }

        $updatedNodes = [];
        $triggerIndex = 0;
        $conditionIndex = 0;
        $actionIndex = 0;

        // Track old to new node ID mappings for edge updates
        $nodeIdMappings = [];

        foreach ($flowMetadata['nodes'] as $node) {
            $nodeType = $node['type'] ?? '';
            $oldNodeId = $node['id'];
            $newNode = $node;

            if (str_contains($nodeType, 'trigger') && isset($triggerIds[$triggerIndex])) {
                $newNodeId = "trigger-{$triggerIds[$triggerIndex]}";
                $newNode['id'] = $newNodeId;
                $newNode['data']['entityId'] = $triggerIds[$triggerIndex];
                $nodeIdMappings[$oldNodeId] = $newNodeId;
                $triggerIndex++;
            } elseif (str_contains($nodeType, 'condition') && isset($conditionIds[$conditionIndex])) {
                $newNodeId = "condition-{$conditionIds[$conditionIndex]}";
                $newNode['id'] = $newNodeId;
                $newNode['data']['entityId'] = $conditionIds[$conditionIndex];
                $nodeIdMappings[$oldNodeId] = $newNodeId;
                $conditionIndex++;
            } elseif (str_contains($nodeType, 'action') && isset($actionIds[$actionIndex])) {
                $newNodeId = "action-{$actionIds[$actionIndex]}";
                $newNode['id'] = $newNodeId;
                $newNode['data']['entityId'] = $actionIds[$actionIndex];
                $nodeIdMappings[$oldNodeId] = $newNodeId;
                $actionIndex++;
            }

            $updatedNodes[] = $newNode;
        }

        // Update edges with new node IDs
        $updatedEdges = [];
        if (isset($flowMetadata['edges'])) {
            foreach ($flowMetadata['edges'] as $edge) {
                $updatedEdge = $edge;

                // Update source if it was mapped
                if (isset($nodeIdMappings[$edge['source']])) {
                    $updatedEdge['source'] = $nodeIdMappings[$edge['source']];
                }

                // Update target if it was mapped
                if (isset($nodeIdMappings[$edge['target']])) {
                    $updatedEdge['target'] = $nodeIdMappings[$edge['target']];
                }

                // Update edge ID to reflect new node IDs
                $updatedEdge['id'] = "edge-{$updatedEdge['source']}-{$updatedEdge['target']}";

                $updatedEdges[] = $updatedEdge;
            }
        }

        return [
            'nodes' => $updatedNodes,
            'edges' => $updatedEdges,
        ];
    }

    /**
     * Remove the specified automation
     */
    public function destroy(Automation $automation): JsonResponse
    {
        Gate::authorize('delete', $automation);

        $automation->delete();

        return response()->json(['message' => 'Automation deleted successfully']);
    }

    /**
     * Toggle automation enabled status
     */
    public function toggle(Automation $automation): JsonResponse
    {
        Gate::authorize('update', $automation);

        // Prevent enabling draft automations or invalid automations
        if (!$automation->enabled && ($automation->is_draft || !$this->isValidAutomation($automation))) {
            return response()->json([
                'error' => 'Cannot enable automation: ' . ($automation->is_draft ? 'Draft automations must be completed first' : 'Automation has validation errors'),
                'enabled' => $automation->enabled
            ], 422);
        }

        $automation->update(['enabled' => !$automation->enabled]);

        return response()->json([
            'message' => 'Automation ' . ($automation->enabled ? 'enabled' : 'disabled'),
            'enabled' => $automation->enabled
        ]);
    }

    /**
     * Validate if an automation is complete and valid for execution
     */
    private function isValidAutomation(Automation $automation): bool
    {
        // Check if automation has at least one trigger and one action
        if ($automation->triggers->isEmpty() || $automation->actions->isEmpty()) {
            return false;
        }

        // Check if all triggers are properly configured
        foreach ($automation->triggers as $trigger) {
            if ($trigger->type === 'time' && (!$trigger->time_at || !$trigger->days_of_week)) {
                return false;
            }
            if ($trigger->type === 'state_change' && (!$trigger->device_id || !$trigger->field)) {
                return false;
            }
            if ($trigger->type === 'mqtt' && !$trigger->mqtt_topic) {
                return false;
            }
        }

        // Check if all actions are properly configured
        foreach ($automation->actions as $action) {
            if ($action->type === 'device_control' && (!$action->device_id || !$action->field)) {
                return false;
            }
            if ($action->type === 'mqtt_publish' && !$action->mqtt_topic) {
                return false;
            }
            if ($action->type === 'notify' && (!$action->notification_title || !$action->notification_message)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get automation execution logs
     */
    public function logs(Request $request, Automation $automation)
    {
        Gate::authorize('view', $automation);

        $logsQuery = $automation->logs();

        // Apply search filter
        if ($request->has('search') && $request->input('search')) {
            $search = $request->input('search');
            $logsQuery->where(function ($q) use ($search) {
                $q->where('status', 'like', '%' . $search . '%')
                    ->orWhere('details', 'like', '%' . $search . '%');
            });
        }

        // Apply status filter
        if ($request->has('status') && $request->input('status') !== 'all') {
            $logsQuery->where('status', $request->input('status'));
        }

        $perPage = $request->input('per_page', 25);
        $perPage = min(max($perPage, 1), 100); // Limit between 1 and 100

        $logs = $logsQuery->orderBy('executed_at', 'desc')->paginate($perPage);

        $resourceCollection = AutomationLogResource::collection($logs);

        return response()->json($resourceCollection->response()->getData(true));
    }

    /**
     * Get automation logs statistics
     */
    public function logsStats(Request $request, Automation $automation): JsonResponse
    {
        Gate::authorize('view', $automation);

        // Base query for all logs
        $allLogsQuery = $automation->logs();

        // Apply search filter to both total and filtered stats
        $searchFiltered = false;
        if ($request->has('search') && $request->input('search')) {
            $search = $request->input('search');
            $searchFilteredQuery = clone $allLogsQuery;
            $searchFilteredQuery->where(function ($q) use ($search) {
                $q->where('status', 'like', '%' . $search . '%')
                    ->orWhere('details', 'like', '%' . $search . '%');
            });
            $searchFiltered = true;
        }

        // Total stats (all logs, no filters applied)
        $totalStats = [
            'total' => $allLogsQuery->count(),
            'successful' => (clone $allLogsQuery)->where('status', 'success')->count(),
            'failed' => (clone $allLogsQuery)->where('status', 'failed')->count(),
            'skipped' => (clone $allLogsQuery)->where('status', 'skipped')->count(),
            'partial' => (clone $allLogsQuery)->where('status', 'partial')->count(),
            'warning' => (clone $allLogsQuery)->where('status', 'warning')->count(),
        ];

        // Filtered stats (matching current search/filters)
        $filteredQuery = clone $allLogsQuery;

        if ($searchFiltered) {
            $search = $request->input('search');
            $filteredQuery->where(function ($q) use ($search) {
                $q->where('status', 'like', '%' . $search . '%')
                    ->orWhere('details', 'like', '%' . $search . '%');
            });
        }

        if ($request->has('status') && $request->input('status') !== 'all') {
            $filteredQuery->where('status', $request->input('status'));
        }

        $filteredStats = [
            'total' => $filteredQuery->count(),
            'successful' => (clone $filteredQuery)->where('status', 'success')->count(),
            'failed' => (clone $filteredQuery)->where('status', 'failed')->count(),
            'skipped' => (clone $filteredQuery)->where('status', 'skipped')->count(),
            'partial' => (clone $filteredQuery)->where('status', 'partial')->count(),
            'warning' => (clone $filteredQuery)->where('status', 'warning')->count(),
        ];

        return response()->json([
            'total_stats' => $totalStats,
            'filtered_stats' => $filteredStats,
        ]);
    }
}