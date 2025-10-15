<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Automation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'enabled',
        'is_draft',
        'flow_metadata',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'is_draft' => 'boolean',
        'flow_metadata' => 'array',
    ];

    /**
     * Get the user that owns the automation
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the triggers for the automation
     */
    public function triggers(): HasMany
    {
        return $this->hasMany(AutomationTrigger::class);
    }

    /**
     * Get the conditions for the automation
     */
    public function conditions(): HasMany
    {
        return $this->hasMany(AutomationCondition::class);
    }

    /**
     * Get the actions for the automation
     */
    public function actions(): HasMany
    {
        return $this->hasMany(AutomationAction::class);
    }

    /**
     * Get the execution logs for the automation
     */
    public function logs(): HasMany
    {
        return $this->hasMany(AutomationLog::class);
    }

    /**
     * Scope a query to only include enabled automations
     */
    public function scopeEnabled($query)
    {
        return $query->where('enabled', true);
    }

    /**
     * Scope a query to include automations for a specific user
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }



    /**
     * Validate the flow structure
     * Checks for cycles and ensures proper path-wise logic flow
     */
    public function validateFlow(): array
    {
        $errors = [];

        if (!$this->flow_metadata) {
            return ['Flow metadata is missing'];
        }

        $nodes = collect($this->flow_metadata['nodes'] ?? [])->keyBy('id');
        $edges = collect($this->flow_metadata['edges'] ?? []);

        if ($nodes->isEmpty()) {
            return ['No nodes found in flow'];
        }

        // Check for basic connectivity and cycles
        if (!$this->validateFlowConnectivity($nodes, $edges, $errors)) {
            return $errors;
        }

        // Validate each execution path individually
        $this->validateExecutionPaths($nodes, $edges, $errors);

        return $errors;
    }

    /**
     * Validate basic flow connectivity and detect cycles
     */
    private function validateFlowConnectivity($nodes, $edges, array &$errors): bool
    {
        // Build adjacency list
        $graph = [];
        $inDegree = [];

        foreach ($nodes as $nodeId => $node) {
            $graph[$nodeId] = [];
            $inDegree[$nodeId] = 0;
        }

        foreach ($edges as $edge) {
            $source = $edge['source'];
            $target = $edge['target'];

            if (isset($graph[$source]) && isset($inDegree[$target])) {
                $graph[$source][] = $target;
                $inDegree[$target]++;
            }
        }

        // Topological sort to detect cycles
        $visited = [];
        $queue = [];

        foreach ($inDegree as $nodeId => $degree) {
            if ($degree === 0) {
                $queue[] = $nodeId;
            }
        }

        while (!empty($queue)) {
            $current = array_shift($queue);
            $visited[] = $current;

            foreach ($graph[$current] as $neighbor) {
                $inDegree[$neighbor]--;
                if ($inDegree[$neighbor] === 0) {
                    $queue[] = $neighbor;
                }
            }
        }

        if (count($visited) < $nodes->count()) {
            $errors[] = 'Flow contains cycles or disconnected components';
            return false;
        }

        return true;
    }

    /**
     * Validate individual execution paths for logical flow order
     */
    private function validateExecutionPaths($nodes, $edges, array &$errors): void
    {
        // Find all trigger nodes (excluding start/end nodes)
        $triggerNodes = $nodes->filter(function ($node) {
            return str_contains($node['type'] ?? '', 'trigger');
        });

        if ($triggerNodes->isEmpty()) {
            $errors[] = 'No trigger nodes found in flow';
            return;
        }

        // Validate each trigger's execution path
        foreach ($triggerNodes as $triggerNodeId => $triggerNode) {
            $this->validateSingleExecutionPath($triggerNodeId, $nodes, $edges, $errors);
        }
    }

    /**
     * Validate execution branches from a single trigger
     */
    private function validateSingleExecutionPath(string $triggerNodeId, $nodes, $edges, array &$errors): void
    {
        try {
            $branches = $this->findExecutionBranchesFromNode($triggerNodeId, $edges, $nodes, []);

            if (empty($branches)) {
                $errors[] = "Trigger {$triggerNodeId} has no execution path";
                return;
            }

            // Validate each branch individually
            foreach ($branches as $branchIndex => $branch) {
                $this->validateBranchOrder($branch, $nodes, $triggerNodeId, $branchIndex, $errors);
            }
        } catch (\Exception $e) {
            $errors[] = "Failed to analyze execution paths for trigger {$triggerNodeId}: " . $e->getMessage();
        }
    }

    /**
     * Validate the logical order of nodes within a single branch
     */
    private function validateBranchOrder(array $branch, $nodes, string $triggerNodeId, int $branchIndex, array &$errors): void
    {
        $pathTypes = [];
        foreach ($branch as $nodeId) {
            $node = $nodes->get($nodeId);
            if ($node) {
                $nodeType = $node['type'] ?? '';
                if (!in_array($nodeType, ['startNode', 'endNode'])) {
                    $pathTypes[] = [
                        'id' => $nodeId,
                        'type' => $nodeType
                    ];
                }
            }
        }

        // Validate that within this branch: triggers come first, then conditions, then actions
        $lastConditionIndex = -1;
        $lastActionIndex = -1;

        foreach ($pathTypes as $index => $nodeInfo) {
            $nodeType = $nodeInfo['type'];

            if (str_contains($nodeType, 'trigger')) {
                // Triggers should not come after conditions or actions in the same branch
                if ($lastConditionIndex >= 0 || $lastActionIndex >= 0) {
                    $errors[] = "Trigger {$nodeInfo['id']} comes after conditions/actions in branch {$branchIndex} of trigger {$triggerNodeId}";
                }
            } elseif (str_contains($nodeType, 'condition')) {
                $lastConditionIndex = $index;
                // Conditions should not come after actions in the same branch
                if ($lastActionIndex >= 0) {
                    $errors[] = "Condition {$nodeInfo['id']} comes after actions in branch {$branchIndex} of trigger {$triggerNodeId}";
                }
            } elseif (str_contains($nodeType, 'action')) {
                $lastActionIndex = $index;
            }
        }
    }

    /**
     * Get all separate execution branches starting from a specific trigger node
     * Returns multiple execution paths, each representing an independent branch
     */
    public function getExecutionBranchesFromTrigger($triggerNodeId): array
    {
        if (!$this->flow_metadata || !isset($this->flow_metadata['nodes']) || !isset($this->flow_metadata['edges'])) {
            return [];
        }

        $nodes = collect($this->flow_metadata['nodes'])->keyBy('id');
        $edges = collect($this->flow_metadata['edges']);

        // Find the trigger node
        $triggerNode = $nodes->get($triggerNodeId);
        if (!$triggerNode || !str_contains($triggerNode['type'] ?? '', 'trigger')) {
            throw new \InvalidArgumentException("Invalid trigger node ID: {$triggerNodeId}");
        }

        // Get all execution branches from trigger
        $branches = $this->findExecutionBranchesFromNode($triggerNodeId, $edges, $nodes, []);

        // Convert branches to structured format with database entities
        $triggers = $this->triggers()->get()->keyBy('id');
        $conditions = $this->conditions()->get()->keyBy('id');
        $actions = $this->actions()->get()->keyBy('id');

        $formattedBranches = [];

        foreach ($branches as $branchIndex => $branch) {
            $pathTrigger = null;
            $pathConditions = collect();
            $pathActions = collect();

            foreach ($branch as $nodeId) {
                $node = $nodes->get($nodeId);
                if (!$node)
                    continue;

                $nodeType = $node['type'] ?? '';

                if (str_contains($nodeType, 'trigger')) {
                    $trigger = $this->findEntityForNode($node, $triggers);
                    if ($trigger)
                        $pathTrigger = $trigger;
                } elseif (str_contains($nodeType, 'condition')) {
                    $condition = $this->findEntityForNode($node, $conditions);
                    if ($condition)
                        $pathConditions->push($condition);
                } elseif (str_contains($nodeType, 'action')) {
                    $action = $this->findEntityForNode($node, $actions);
                    if ($action)
                        $pathActions->push($action);
                }
            }

            $formattedBranches[] = [
                'trigger' => $pathTrigger,
                'conditions' => $pathConditions,
                'actions' => $pathActions,
                'path' => $branch
            ];
        }

        return $formattedBranches;
    }



    /**
     * Find all separate execution branches from a given node
     * Each branch represents an independent path that should be evaluated separately
     * Follows graph edges to determine the correct execution flow
     */
    private function findExecutionBranchesFromNode(string $startNodeId, $edges, $nodes, array $currentPath): array
    {
        $currentPath[] = $startNodeId;

        // Find all outgoing edges from current node
        $outgoingEdges = $edges->where('source', $startNodeId);

        // If this is a leaf node (no outgoing edges), return the current path as a complete branch
        if ($outgoingEdges->isEmpty()) {
            return [$currentPath];
        }

        $branches = [];

        // For each outgoing edge, create a separate branch following the graph structure
        foreach ($outgoingEdges as $edge) {
            $targetNodeId = $edge['target'];
            $targetNode = $nodes->get($targetNodeId);

            if (!$targetNode)
                continue;

            // Prevent infinite loops by checking if we've already visited this node in current path
            if (in_array($targetNodeId, $currentPath)) {
                continue;
            }

            // Recursively find branches from the target node
            $subBranches = $this->findExecutionBranchesFromNode($targetNodeId, $edges, $nodes, $currentPath);

            // Add all sub-branches to our result
            $branches = array_merge($branches, $subBranches);
        }

        return $branches;
    }



    /**
     * Find database entity that corresponds to a flow node
     * Uses multiple matching strategies in order of reliability
     */
    private function findEntityForNode($node, $entities)
    {
        $nodeId = $node['id'];
        $nodeData = $node['data'] ?? [];

        // Strategy 1: Use stored entity ID in node data (most reliable)
        if (isset($nodeData['entityId'])) {
            $entity = $entities->get($nodeData['entityId']);
            if ($entity) {
                return $entity;
            }
        }

        // Strategy 2: Legacy support for explicit type-specific IDs
        if (isset($nodeData['triggerId'])) {
            return $entities->get($nodeData['triggerId']);
        }
        if (isset($nodeData['conditionId'])) {
            return $entities->get($nodeData['conditionId']);
        }
        if (isset($nodeData['actionId'])) {
            return $entities->get($nodeData['actionId']);
        }

        // Strategy 3: Extract entity ID from node ID patterns like "trigger-79"
        if (preg_match('/^(trigger|condition|action)-(\d+)$/', $nodeId, $matches)) {
            $extractedId = (int) $matches[2];
            $entity = $entities->get($extractedId);
            if ($entity) {
                return $entity;
            }
        }

        return null;
    }



    /**
     * Get all possible execution paths from all triggers
     * Returns separate execution branches for proper conditional handling
     */
    public function getAllExecutionPaths(): array
    {
        if (!$this->flow_metadata || !isset($this->flow_metadata['nodes'])) {
            return [];
        }

        $nodes = collect($this->flow_metadata['nodes']);
        $triggerNodes = $nodes->filter(function ($node) {
            return str_contains($node['type'] ?? '', 'trigger');
        });

        $allPaths = [];

        foreach ($triggerNodes as $triggerNode) {
            try {
                $branches = $this->getExecutionBranchesFromTrigger($triggerNode['id']);

                // Create unique identifiers for each branch
                foreach ($branches as $branchIndex => $branch) {
                    $pathId = $triggerNode['id'] . '_branch_' . $branchIndex;
                    $allPaths[$pathId] = $branch;
                }
            } catch (\Exception $e) {
                // Skip invalid trigger nodes
                continue;
            }
        }

        return $allPaths;
    }
}