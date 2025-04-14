<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Device;
use Illuminate\Support\Facades\Auth;

class CheckUserDeviceOwnership
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $deviceId = $request->route('deviceId');

        if (!$deviceId) {
            return response()->json(['message' => 'Device not found.'], 404);
        }

        $user = Auth::user();

        $deviceExists = $user->devices()->where('device_id', $deviceId)->exists();

        if (!$deviceExists) {
            return response()->json(['message' => 'Device not found.'], 404);
        }

        return $next($request);
    }
}