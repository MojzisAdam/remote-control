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
}
