<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TrafficAnalyticsController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('reset-password/{token}', function () {
    abort(404); // Pretend the route does not exist
})->name('password.reset');

// Traffic Analytics Routes - protected and returns 404 if user is not superadmin
Route::middleware(['notfound.unauthorized'])->prefix('admin')->group(function () {
    Route::get('/traffic', [TrafficAnalyticsController::class, 'dashboard'])->name('traffic.dashboard');

    // API endpoints for the dashboard
    Route::prefix('api/traffic')->group(function () {
        Route::get('/routes', [TrafficAnalyticsController::class, 'getMostVisitedRoutes'])->name('traffic.routes');
        Route::get('/trend', [TrafficAnalyticsController::class, 'getTrafficTrend'])->name('traffic.trend');
        Route::get('/users', [TrafficAnalyticsController::class, 'getUserActivity'])->name('traffic.users');
        Route::get('/ips', [TrafficAnalyticsController::class, 'getIpActivity'])->name('traffic.ips');
        Route::get('/response-times', [TrafficAnalyticsController::class, 'getResponseTimes'])->name('traffic.response');
    });
});