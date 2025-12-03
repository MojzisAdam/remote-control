<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->statefulApi();
        $middleware->prepend(\App\Http\Middleware\SetLanguageMiddleware::class);
        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);
        $middleware->append(\App\Http\Middleware\TrafficAnalyticsMiddleware::class);
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'permission' => \App\Http\Middleware\PermissionMiddleware::class,
            'device.ownership' => \App\Http\Middleware\CheckUserDeviceOwnership::class,
            'api_key' => \App\Http\Middleware\ApiKeyMiddleware::class,
            'notfound.unauthorized' => \App\Http\Middleware\NotFoundForUnauthorizedUsers::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();