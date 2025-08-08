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

        $selectedColumns = array_merge(['cas'], $validated['selectedMetrics']);
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

        return response()->json($preference ? json_decode($preference->hidden_lines, true) : []);
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
        $deviceExists = Device::where('id', $deviceId)->exists();

        if (!$deviceExists) {
            return response()->json(['error' => 'Device not found'], 404);
        }

        $startDate = Carbon::now()->subYear()->startOfDay();

        $query = DeviceHistory::select([
            DB::raw('YEAR(cas) as year'),
            DB::raw('MONTH(cas) as month'),
            DB::raw('AVG(TS1) as avg_ts1'),
            DB::raw('AVG(TS2) as avg_ts2'),
            DB::raw('AVG(TS4) as avg_ts4'),
        ])
            ->where('cas', '>=', $startDate)
            ->whereNotNull('TS1')
            ->whereNotNull('TS2')
            ->whereNotNull('TS4')
            ->groupBy(DB::raw('YEAR(cas)'), DB::raw('MONTH(cas)'))
            ->orderBy(DB::raw('YEAR(cas)'))
            ->orderBy(DB::raw('MONTH(cas)'));

        if ($deviceId) {
            $query->where('device_id', $deviceId);
        }

        $monthlyAverages = $query->get();

        $formattedResponse = $monthlyAverages->map(function ($item) {
            $monthName = Carbon::createFromDate($item->year, $item->month, 1)->format('F');

            return [
                'year' => $item->year,
                'month' => $item->month,
                'month_name' => $monthName,
                'avg_ts1' => round($item->avg_ts1, 2),
                'avg_ts2' => round($item->avg_ts2, 2),
                'avg_ts4' => round($item->avg_ts4, 2),
            ];
        });

        return response()->json([
            'data' => $formattedResponse,
            'meta' => [
                'period' => 'Past 12 months',
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => Carbon::now()->format('Y-m-d'),
                'sensors' => ['TS1', 'TS2', 'TS4'],
                'device_id' => $deviceId ?? 'all'
            ]
        ]);
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