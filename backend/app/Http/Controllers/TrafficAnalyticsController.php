<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TrafficLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Helpers\LogRetentionHelper;
use App\Traits\BatchDeletes;

class TrafficAnalyticsController extends Controller
{
    use BatchDeletes;

    /**
     * Display the traffic analytics dashboard
     */
    public function dashboard()
    {
        $period = request('period', 'day');
        $validPeriods = ['hour', 'day', 'week', 'month'];

        if (!in_array($period, $validPeriods)) {
            $period = 'day';
        }

        return view('analytics.dashboard', [
            'period' => $period,
            'periods' => $validPeriods,
        ]);
    }

    /**
     * Get the most visited routes
     */
    public function getMostVisitedRoutes(Request $request)
    {
        $period = $request->get('period', 'day');
        $limit = $request->get('limit', 10);

        $routes = TrafficLog::getMostVisitedRoutes($period, $limit);

        return response()->json([
            'data' => $routes,
            'period' => $period,
        ]);
    }

    /**
     * Get traffic trend over time
     */
    public function getTrafficTrend(Request $request)
    {
        $period = $request->get('period', 'day');
        $interval = 'hour';

        // Adjust interval based on period
        if ($period === 'hour') {
            $interval = 'minute';
        } elseif ($period === 'week' || $period === 'month') {
            $interval = 'day';
        }

        $trend = TrafficLog::getTrafficByTime($period, $interval);

        return response()->json([
            'data' => $trend,
            'period' => $period,
            'interval' => $interval,
        ]);
    }

    /**
     * Get user activity statistics
     */
    public function getUserActivity(Request $request)
    {
        $period = $request->get('period', 'day');

        $userActivity = TrafficLog::fromPeriod($period)
            ->whereNotNull('user_id')
            ->select('user_id')
            ->selectRaw('count(*) as request_count')
            ->groupBy('user_id')
            ->orderByDesc('request_count')
            ->limit(10)
            ->with('user:id,name,email')
            ->get();

        return response()->json([
            'data' => $userActivity,
            'period' => $period,
        ]);
    }

    /**
     * Get IP activity statistics
     */
    public function getIpActivity(Request $request)
    {
        $period = $request->get('period', 'day');

        $ipActivity = TrafficLog::fromPeriod($period)
            ->select('ip_address')
            ->selectRaw('count(*) as request_count')
            ->groupBy('ip_address')
            ->orderByDesc('request_count')
            ->limit(10)
            ->get();

        return response()->json([
            'data' => $ipActivity,
            'period' => $period,
        ]);
    }

    /**
     * Get average response time per route
     */
    public function getResponseTimes(Request $request)
    {
        $period = $request->get('period', 'day');

        $responseTimes = TrafficLog::fromPeriod($period)
            ->select('route', 'method')
            ->selectRaw('AVG(response_time) as avg_time')
            ->selectRaw('COUNT(*) as request_count')
            ->groupBy('route', 'method')
            ->having('request_count', '>', 5) // Only include routes with sufficient data
            ->orderByDesc('avg_time')
            ->limit(10)
            ->get();

        return response()->json([
            'data' => $responseTimes,
            'period' => $period,
        ]);
    }

    /**
     * Delete old traffic logs
     */
    public function deleteOldLogs(Request $request)
    {
        $request->validate([
            'period' => ['required', 'in:' . implode(',', LogRetentionHelper::VALID_PERIODS)],
        ]);

        $cutoffDate = LogRetentionHelper::cutoffDate($request->input('period'));

        $pendingCount = DB::table('traffic_logs')
            ->where('created_at', '<', $cutoffDate)
            ->count();

        if ($pendingCount === 0) {
            return response()->json([
                'success' => true,
                'message' => 'No log entries found older than the cutoff date.',
                'deleted_count' => 0,
                'cutoff_date' => $cutoffDate->toDateTimeString(),
            ]);
        }

        // Disable PHP's execution time limit for this request
        set_time_limit(0);

        try {
            $deletedCount = $this->batchDelete(
                table: 'traffic_logs',
                dateColumn: 'created_at',
                cutoff: $cutoffDate,
                cursorColumn: 'id',
            );

            return response()->json([
                'success' => true,
                'message' => "Successfully deleted {$deletedCount} log entries older than {$cutoffDate->toDateTimeString()}.",
                'deleted_count' => $deletedCount,
                'cutoff_date' => $cutoffDate->toDateTimeString(),
            ]);

        } catch (\Exception $e) {
            \Log::error('Error deleting traffic logs: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting logs. Please try again.',
            ], 500);
        }
    }

    /**
     * Get statistics about log storage
     */
    public function getLogStats(Request $request)
    {
        $now = now();

        $stats = \DB::table('traffic_logs')
            ->selectRaw('COUNT(*) as total')
            ->selectRaw('SUM(created_at >= ?) as last_week', [$now->copy()->subWeek()])
            ->selectRaw('SUM(created_at >= ?) as last_month', [$now->copy()->subMonth()])
            ->selectRaw('SUM(created_at >= ?) as last_3_months', [$now->copy()->subMonths(3)])
            ->selectRaw('SUM(created_at >= ?) as last_6_months', [$now->copy()->subMonths(6)])
            ->selectRaw('SUM(created_at >= ?) as last_year', [$now->copy()->subYear()])
            ->selectRaw('MIN(created_at) as oldest_log_date')
            ->selectRaw('MAX(created_at) as newest_log_date')
            ->first();

        return response()->json([
            'total_logs' => (int) $stats->total,

            'logs_last_week' => (int) $stats->last_week,
            'logs_last_month' => (int) $stats->last_month,
            'logs_last_3_months' => (int) $stats->last_3_months,
            'logs_last_6_months' => (int) $stats->last_6_months,
            'logs_last_year' => (int) $stats->last_year,

            'oldest_log_date' => $stats->oldest_log_date
                ? Carbon::parse($stats->oldest_log_date)->format('Y-m-d H:i:s')
                : null,

            'newest_log_date' => $stats->newest_log_date
                ? Carbon::parse($stats->newest_log_date)->format('Y-m-d H:i:s')
                : null,

            'logs_older_than_week' => max(0, $stats->total - $stats->last_week),
            'logs_older_than_month' => max(0, $stats->total - $stats->last_month),
            'logs_older_than_3_months' => max(0, $stats->total - $stats->last_3_months),
            'logs_older_than_6_months' => max(0, $stats->total - $stats->last_6_months),
            'logs_older_than_year' => max(0, $stats->total - $stats->last_year),
        ]);
    }
}