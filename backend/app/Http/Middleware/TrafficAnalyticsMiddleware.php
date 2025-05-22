<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\TrafficLog;

class TrafficAnalyticsMiddleware
{
    /**
     * Routes that should not be logged.
     *
     * @var array
     */
    protected $excludedRoutes = [
        'api/up', // Health check
        'api/health',
        'telescope', // Laravel Telescope routes
        'horizon', // Laravel Horizon routes
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Skip logging for excluded routes
        foreach ($this->excludedRoutes as $route) {
            if ($request->is($route)) {
                return $next($request);
            }
        }

        // Measure response time
        $startTime = microtime(true);

        // Process request
        $response = $next($request);

        // Calculate response time
        $responseTime = microtime(true) - $startTime;

        // Only log API routes
        if (strpos($request->path(), 'api') === 0) {
            // Get route details
            $route = $request->route() ? $request->route()->uri() : $request->path();

            // Check if user is authenticated
            $userId = Auth::check() ? Auth::id() : null;

            // Log the request asynchronously to prevent impact on response time
            TrafficLog::create([
                'route' => $route,
                'method' => $request->method(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'user_id' => $userId,
                'status_code' => $response->getStatusCode(),
                'response_time' => $responseTime,
            ]);
        }

        return $response;
    }
}
