<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Device;
use App\Models\DeviceHistory;
use App\Models\UserGraphPreference;
use App\Models\UserCustomGraph;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\UserCustomGraphResource;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Http\Resources\UserGraphPreferenceResource;
use App\Services\DeviceHistory\DeviceHistoryHandlerFactory;
use App\Services\DeviceHistory\DeviceHistoryResourceFactory;
use Illuminate\Support\Facades\Cache;

class HistoryController extends Controller
{
    /**
     * Fetch device history with optional date range.
     */
    public function getDeviceHistory(Request $request, $deviceId)
    {
        $device = Device::where('id', $deviceId)->first();
        if (!$device) {
            return response()->json(['error' => 'Device not found'], 404);
        }

        $handler = DeviceHistoryHandlerFactory::make($device);
        $query = $handler->getQuery($deviceId);
        $query = $handler->applyDateRange($query, $request);

        $history = $query->orderBy('cas', 'asc')->get();

        return DeviceHistoryResourceFactory::makeDataTransformation($handler, $history);
    }

    public function getCustomGraphData(Request $request, $deviceId)
    {
        $device = Device::where('id', $deviceId)->first();
        if (!$device) {
            return response()->json(['error' => 'Device not found'], 404);
        }

        $validated = $request->validate([
            'selectedMetrics' => 'required|array'
        ]);

        $handler = DeviceHistoryHandlerFactory::make($device);
        $query = $handler->getQuery($deviceId);
        $query = $handler->applyDateRange($query, $request);

        // Get available columns for this device display type
        $availableColumns = $handler->getAvailableColumns();

        // Filter selected metrics to only include existing columns
        $validMetrics = array_intersect($validated['selectedMetrics'], $availableColumns);

        // Always include 'cas' column
        $selectedColumns = array_merge(['cas'], $validMetrics);

        // Remove duplicates in case 'cas' was in selectedMetrics
        $selectedColumns = array_unique($selectedColumns);

        // Log warning if some columns were filtered out
        $invalidColumns = array_diff($validated['selectedMetrics'], $availableColumns);
        if (!empty($invalidColumns)) {
        }

        $history = $query->orderBy('cas', 'asc')->get($selectedColumns);

        return DeviceHistoryResourceFactory::makeDynamicDataTransformation($handler, $history);
    }

    /**
     * Get user's hidden lines for a specific device.
     */
    public function getHiddenLines($deviceId)
    {
        $userId = Auth::id();

        $deviceExists = Device::where('id', $deviceId)->exists();
        if (!$deviceExists) {
            return response()->json(['error' => 'Device not found'], 404);
        }

        $preference = UserGraphPreference::where('user_id', $userId)
            ->where('device_id', $deviceId)
            ->first();

        $hiddenLines = $preference->hidden_lines ?? [];

        if (is_string($hiddenLines)) {
            $hiddenLines = json_decode($hiddenLines, true) ?? [];
        }

        return response()->json(array_values($hiddenLines));
    }

    /**
     * Update user's hidden lines for a specific device.
     */
    public function updateHiddenLines(Request $request, $deviceId)
    {
        $userId = Auth::id();

        $validated = $request->validate([
            'hidden_lines' => 'array'
        ]);

        $hiddenLines = $validated['hidden_lines'] ?? [];

        $preference = UserGraphPreference::updateOrCreate(
            ['user_id' => $userId, 'device_id' => $deviceId],
            ['hidden_lines' => json_encode($hiddenLines)]
        );

        // return response()->json(['message' => 'Preferences updated', 'data' => $preference]);
        return response()->json(['message' => 'Preferences updated', 'data' => new UserGraphPreferenceResource($preference)]);
    }

    /**
     * Get all saved custom graphs for the user.
     */
    public function getCustomGraphs($deviceId)
    {
        $userId = Auth::id();
        $graphs = UserCustomGraph::where('user_id', $userId)
            ->where('device_id', $deviceId)
            ->get();

        return UserCustomGraphResource::collection($graphs);
    }

    /**
     * Save a new custom graph.
     */
    public function saveCustomGraph(Request $request, $deviceId)
    {
        $userId = Auth::id();

        $validated = $request->validate([
            'graphName' => 'required|string',
            'selectedMetrics' => 'array|required',
        ]);

        $graph = UserCustomGraph::create([
            'user_id' => $userId,
            'device_id' => $deviceId,
            'graph_name' => $validated['graphName'],
            'selected_metrics' => json_encode($validated['selectedMetrics']),
        ]);

        return response()->json(['message' => 'Graph saved', 'data' => new UserCustomGraphResource($graph)]);
    }

    /**
     * Update a saved custom graph.
     */
    public function updateCustomGraph(Request $request, $graphId)
    {
        $validated = $request->validate([
            'graphName' => 'required|string',
            'selectedMetrics' => 'required|array',
        ]);

        $customGraph = UserCustomGraph::findOrFail($graphId);

        $customGraph->update([
            'graph_name' => $validated['graphName'],
            'selected_metrics' => json_encode($validated['selectedMetrics']),
        ]);

        return new UserCustomGraphResource($customGraph);
    }

    /**
     * Delete a saved custom graph.
     */
    public function deleteCustomGraph($graphId)
    {
        $userId = Auth::id();
        $graph = UserCustomGraph::where('id', $graphId)->where('user_id', $userId)->first();

        if (!$graph) {
            return response()->json(['error' => 'Graph not found'], 404);
        }

        $graph->delete();
        return response()->json(['message' => 'Graph deleted']);
    }

    public function getMonthlyAverageTemperatures(Request $request, $deviceId)
    {
        $device = Device::findOrFail($deviceId);
        $handler = DeviceHistoryHandlerFactory::make($device);

        $temperatureColumns = $handler->getTemperatureColumns();
        if (empty($temperatureColumns)) {
            return response()->json([
                'error' => 'No temperature columns available for this device display type'
            ], 400);
        }

        $now = Carbon::now();
        $results = collect();

        // Build 12 months: 11 completed + current
        for ($i = 11; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            $isCurrentMonth = $i === 0;

            $cacheKey = "monthly_avg_{$deviceId}_{$month->format('Y_m')}";

            $ttl = $isCurrentMonth ? now()->addHour() : now()->addYear();

            $monthData = Cache::remember($cacheKey, $ttl, fn() => $this->computeMonthAverage(
                $handler,
                $deviceId,
                $month,
                $temperatureColumns
            ));

            if ($monthData) {
                $results->push($monthData);
            }
        }

        return response()->json([
            'data' => $results,
            'meta' => [
                'period' => 'Past 12 months',
                'start_date' => $now->copy()->subMonths(11)->startOfMonth()->format('Y-m-d'),
                'end_date' => $now->copy()->endOfMonth()->format('Y-m-d'),
                'sensors' => $temperatureColumns,
                'device_id' => $deviceId,
            ]
        ]);
    }

    private function computeMonthAverage($handler, $deviceId, Carbon $month, array $temperatureColumns): ?array
    {
        $startOfMonth = $month->copy()->startOfMonth();
        $endOfMonth = $month->copy()->endOfMonth();

        $selectArray = [
            DB::raw("YEAR(cas) as year"),
            DB::raw("MONTH(cas) as month"),
            DB::raw("DATE_FORMAT(cas, '%M') as month_name"),
        ];

        foreach ($temperatureColumns as $column) {
            $selectArray[] = DB::raw("ROUND(AVG({$column}), 2) as avg_{$column}");
        }

        $result = $handler->getQuery($deviceId)
            ->select($selectArray)
            ->where('cas', '>=', $startOfMonth)
            ->where('cas', '<=', $endOfMonth)
            ->groupBy('year', 'month', 'month_name')
            ->first();

        return $result ? $result->toArray() : null;
    }

    public function paginated(Request $request, $deviceId)
    {
        $device = Device::where('id', $deviceId)->first();
        if (!$device) {
            return response()->json(['error' => 'Device not found'], 404);
        }

        $page = $request->query('page', 1);
        $perPage = $request->query('per_page', 10);
        $fromDate = $request->query('from_date');
        $toDate = $request->query('to_date');
        $errorOnly = $request->boolean('error_only');

        $handler = DeviceHistoryHandlerFactory::make($device);
        $query = $handler->getQuery($deviceId);

        if ($fromDate) {
            $query->where('cas', '>=', $fromDate);
        }

        if ($toDate) {
            $query->where('cas', '<=', $toDate);
        }

        $query = $handler->applyErrorFilter($query, $errorOnly);
        $query->orderBy('cas', 'desc');

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        return DeviceHistoryResourceFactory::makeHistoryTable($handler, $paginator);
    }

    public function insertHistory(Request $request)
    {
        // Get device to determine type
        $deviceId = $request->input('device_id');
        $device = Device::where('id', $deviceId)->first();

        if (!$device) {
            return response()->json(['error' => 'Device not found'], 404);
        }

        $handler = DeviceHistoryHandlerFactory::make($device);
        $validated = $request->validate($handler->getInsertValidationRules());

        $handler->insertHistory($validated);

        return response()->json(['status' => 'success']);
    }
}