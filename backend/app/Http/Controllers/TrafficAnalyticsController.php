<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TrafficLog;
use Illuminate\Support\Facades\DB;

class TrafficAnalyticsController extends Controller
{
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
            'period' => 'required|in:week,month,3months,6months,year',
        ]);

        $period = $request->get('period');
        $deletedCount = 0;

        try {
            // Calculate the cutoff date based on the period
            $cutoffDate = match ($period) {
                'week' => now()->subWeek(),
                'month' => now()->subMonth(),
                '3months' => now()->subMonths(3),
                '6months' => now()->subMonths(6),
                'year' => now()->subYear(),
            };

            // Delete logs older than the cutoff date
            $deletedCount = TrafficLog::where('created_at', '<', $cutoffDate)->delete();

            return response()->json([
                'success' => true,
                'message' => "Successfully deleted {$deletedCount} log entries older than " . $cutoffDate->format('Y-m-d H:i:s'),
                'deleted_count' => $deletedCount,
                'cutoff_date' => $cutoffDate->format('Y-m-d H:i:s'),
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
        $totalLogs = TrafficLog::count();
        $logsLastWeek = TrafficLog::where('created_at', '>=', now()->subWeek())->count();
        $logsLastMonth = TrafficLog::where('created_at', '>=', now()->subMonth())->count();
        $logsLast3Months = TrafficLog::where('created_at', '>=', now()->subMonths(3))->count();
        $logsLast6Months = TrafficLog::where('created_at', '>=', now()->subMonths(6))->count();
        $logsLastYear = TrafficLog::where('created_at', '>=', now()->subYear())->count();

        $oldestLog = TrafficLog::oldest()->first();
        $newestLog = TrafficLog::latest()->first();

        return response()->json([
            'total_logs' => $totalLogs,
            'logs_last_week' => $logsLastWeek,
            'logs_last_month' => $logsLastMonth,
            'logs_last_3_months' => $logsLast3Months,
            'logs_last_6_months' => $logsLast6Months,
            'logs_last_year' => $logsLastYear,
            'oldest_log_date' => $oldestLog ? $oldestLog->created_at->format('Y-m-d H:i:s') : null,
            'newest_log_date' => $newestLog ? $newestLog->created_at->format('Y-m-d H:i:s') : null,
            'logs_older_than_week' => $totalLogs - $logsLastWeek,
            'logs_older_than_month' => $totalLogs - $logsLastMonth,
            'logs_older_than_3_months' => $totalLogs - $logsLast3Months,
            'logs_older_than_6_months' => $totalLogs - $logsLast6Months,
            'logs_older_than_year' => $totalLogs - $logsLastYear,
        ]);
    }
}