<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ApiKeyMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, $tokenKey = null)
    {
        $apiKey = $request->header('X-Api-Key');

        $validTokens = config('app.api_valid_tokens');

        $expectedToken = $tokenKey && isset($validTokens[$tokenKey])
            ? $validTokens[$tokenKey]
            : ($validTokens['default'] ?? 'default_token');

        if (!$apiKey || $apiKey !== $expectedToken) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return $next($request);
    }
}