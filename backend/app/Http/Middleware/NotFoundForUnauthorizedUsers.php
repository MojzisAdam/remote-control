<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class NotFoundForUnauthorizedUsers
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // If the user is not authenticated or doesn't have the superadmin role, return 404
        if (!auth()->check() || !auth()->user()->hasRole('superadmin')) {
            abort(404);
        }

        return $next($request);
    }
}