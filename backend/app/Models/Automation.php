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
     * Get the execution order of components based on React Flow edges
     * Returns an array of node IDs in the order they should be executed
     */
    public function getExecutionOrder(): array
    {
        if (!$this->flow_metadata || !isset($this->flow_metadata['nodes']) || !isset($this->flow_metadata['edges'])) {
            // Fallback to database creation order if no flow metadata
            return [];
        }

        $nodes = collect($this->flow_metadata['nodes'])->keyBy('id');
        $edges = $this->flow_metadata['edges'];

        // Build adjacency list (node -> list of connected nodes)
        $graph = [];
        $inDegree = [];

        // Initialize graph
        foreach ($nodes as $nodeId => $node) {
            $graph[$nodeId] = [];
            $inDegree[$nodeId] = 0;
        }

        // Build edges and calculate in-degrees
        foreach ($edges as $edge) {
            $source = $edge['source'];
            $target = $edge['target'];

            if (isset($graph[$source]) && isset($inDegree[$target])) {
                $graph[$source][] = $target;
                $inDegree[$target]++;
            }
        }

        // Topological sort using Kahn's algorithm
        $result = [];
        $queue = [];

        // Find all nodes with no incoming edges (starting points)
        foreach ($inDegree as $nodeId => $degree) {
            if ($degree === 0) {
                $queue[] = $nodeId;
            }
        }

        while (!empty($queue)) {
            $current = array_shift($queue);
            $result[] = $current;

            // For each neighbor of current node
            foreach ($graph[$current] as $neighbor) {
                $inDegree[$neighbor]--;
                if ($inDegree[$neighbor] === 0) {
                    $queue[] = $neighbor;
                }
            }
        }

        return $result;
    }


    /**
     * Get conditions in execution order based on flow metadata
     */
    public function getConditionsInOrder()
    {
        $executionOrder = $this->getExecutionOrder();
        $conditions = $this->conditions()->get()->keyBy('id');
        $nodes = collect($this->flow_metadata['nodes'] ?? [])->keyBy('id');

        $orderedConditions = collect();

        foreach ($executionOrder as $nodeId) {
            $node = $nodes->get($nodeId);
            if ($node && isset($node['type']) && str_contains($node['type'], 'condition')) {
                // Match node ID to condition
                $conditionFound = $conditions->first(function ($condition) use ($nodeId, $node) {
                    return str_contains($nodeId, (string) $condition->id) ||
                        (isset($node['data']['conditionId']) && $node['data']['conditionId'] == $condition->id);
                });

                if ($conditionFound) {
                    $orderedConditions->push($conditionFound);
                }
            }
        }

        // Fallback to database order if flow parsing fails
        return $orderedConditions->isNotEmpty() ? $orderedConditions : $this->conditions;
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
     * Validate a single execution path starting from a trigger
     */
    private function validateSingleExecutionPath(string $triggerNodeId, $nodes, $edges, array &$errors): void
    {
        $visited = [];
        $path = $this->traversePathFromNode($triggerNodeId, $edges, $nodes, $visited);

        if (empty($path)) {
            $errors[] = "Trigger {$triggerNodeId} has no execution path";
            return;
        }

        // Check logical order within this specific path
        $pathTypes = [];
        foreach ($path as $nodeId) {
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

        // Validate that within this path: triggers come first, then conditions, then actions
        $lastTriggerIndex = -1;
        $lastConditionIndex = -1;
        $lastActionIndex = -1;

        foreach ($pathTypes as $index => $nodeInfo) {
            $nodeType = $nodeInfo['type'];

            if (str_contains($nodeType, 'trigger')) {
                $lastTriggerIndex = $index;
                // Triggers should not come after conditions or actions in the same path
                if ($lastConditionIndex >= 0 || $lastActionIndex >= 0) {
                    $errors[] = "Trigger {$nodeInfo['id']} comes after conditions/actions in its execution path";
                }
            } elseif (str_contains($nodeType, 'condition')) {
                $lastConditionIndex = $index;
                // Conditions should not come after actions in the same path
                if ($lastActionIndex >= 0) {
                    $errors[] = "Condition {$nodeInfo['id']} comes after actions in its execution path";
                }
            } elseif (str_contains($nodeType, 'action')) {
                $lastActionIndex = $index;
            }
        }
    }

    /**
     * Get the execution path starting from a specific trigger node
     * Returns conditions and actions reachable from the trigger
     */
    public function getExecutionPathFromTrigger($triggerNodeId): array
    {
        if (!$this->flow_metadata || !isset($this->flow_metadata['nodes']) || !isset($this->flow_metadata['edges'])) {
            return [
                'trigger' => null,
                'conditions' => collect(),
                'actions' => collect(),
                'path' => []
            ];
        }

        $nodes = collect($this->flow_metadata['nodes'])->keyBy('id');
        $edges = collect($this->flow_metadata['edges']);

        // Find the trigger node
        $triggerNode = $nodes->get($triggerNodeId);
        if (!$triggerNode || !str_contains($triggerNode['type'] ?? '', 'trigger')) {
            throw new \InvalidArgumentException("Invalid trigger node ID: {$triggerNodeId}");
        }

        // Traverse the path from trigger
        $visitedNodes = [];
        $path = $this->traversePathFromNode($triggerNodeId, $edges, $nodes, $visitedNodes);

        // Get database entities for nodes in path
        $triggers = $this->triggers()->get()->keyBy('id');
        $conditions = $this->conditions()->get()->keyBy('id');
        $actions = $this->actions()->get()->keyBy('id');

        $pathTrigger = null;
        $pathConditions = collect();
        $pathActions = collect();

        foreach ($path as $nodeId) {
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

        return [
            'trigger' => $pathTrigger,
            'conditions' => $pathConditions,
            'actions' => $pathActions,
            'path' => $path
        ];
    }

    /**
     * Traverse the execution path from a given node using DFS
     */
    private function traversePathFromNode(string $startNodeId, $edges, $nodes, array &$visited): array
    {
        if (in_array($startNodeId, $visited)) {
            return []; // Cycle detection
        }

        $visited[] = $startNodeId;
        $path = [$startNodeId];

        // Find all outgoing edges from current node
        $outgoingEdges = $edges->where('source', $startNodeId);

        foreach ($outgoingEdges as $edge) {
            $targetNodeId = $edge['target'];
            $targetNode = $nodes->get($targetNodeId);

            if (!$targetNode)
                continue;

            // Recursively traverse connected nodes
            $subPath = $this->traversePathFromNode($targetNodeId, $edges, $nodes, $visited);
            $path = array_merge($path, $subPath);
        }

        return array_unique($path);
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
     * Execute a specific trigger path
     */
    public function executePathFromTrigger($triggerNodeId)
    {
        $path = $this->getExecutionPathFromTrigger($triggerNodeId);

        return [
            'trigger_node_id' => $triggerNodeId,
            'trigger' => $path['trigger'],
            'conditions' => $path['conditions'],
            'actions' => $path['actions'],
            'execution_path' => $path['path'],
            'path_valid' => !empty($path['trigger'])
        ];
    }

    /**
     * Get all possible execution paths from all triggers
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

        $paths = [];
        foreach ($triggerNodes as $triggerNode) {
            try {
                $paths[$triggerNode['id']] = $this->getExecutionPathFromTrigger($triggerNode['id']);
            } catch (\Exception $e) {
                // Skip invalid trigger nodes
                continue;
            }
        }

        return $paths;
    }
}