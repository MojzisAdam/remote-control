<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TrafficAnalyticsController;
use App\Http\Controllers\UpdateManagerController;
use App\Http\Controllers\UpdateApiController;

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

    // Update Manager Routes
    Route::get('/updates', [UpdateManagerController::class, 'dashboard'])->name('update_manager.dashboard');

    // Branch Routes
    Route::prefix('updates/branches')->group(function () {
        Route::get('/', [UpdateManagerController::class, 'branchesList'])->name('update_manager.branches.list');
        Route::get('/create', [UpdateManagerController::class, 'createBranchForm'])->name('update_manager.branches.create');
        Route::post('/store', [UpdateManagerController::class, 'storeBranch'])->name('update_manager.branches.store');
        Route::get('/{branch}/edit', [UpdateManagerController::class, 'editBranchForm'])->name('update_manager.branches.edit');
        Route::put('/{branch}', [UpdateManagerController::class, 'updateBranch'])->name('update_manager.branches.update');
        Route::delete('/{branch}', [UpdateManagerController::class, 'deleteBranch'])->name('update_manager.branches.delete');
    });

    // Version Routes
    Route::prefix('updates/branches/{branch}/versions')->group(function () {
        Route::get('/', [UpdateManagerController::class, 'versionsList'])->name('update_manager.versions.list');
        Route::get('/create', [UpdateManagerController::class, 'createVersionForm'])->name('update_manager.versions.create');
        Route::post('/store', [UpdateManagerController::class, 'storeVersion'])->name('update_manager.versions.store');
        Route::get('/{version}', [UpdateManagerController::class, 'showVersion'])->name('update_manager.versions.show');
        Route::post('/{version}/set-current', [UpdateManagerController::class, 'setVersionAsCurrent'])->name('update_manager.versions.set-current');
        Route::delete('/{version}', [UpdateManagerController::class, 'deleteVersion'])->name('update_manager.versions.delete');
        Route::get('/{version}/artifacts/{artifact}/download', [UpdateManagerController::class, 'downloadArtifact'])->name('update_manager.artifacts.download');
    });

    // Update Logs
    Route::get('/updates/logs', [UpdateManagerController::class, 'logs'])->name('update_manager.logs');

    // Python Version Routes
    Route::prefix('updates/python')->group(function () {
        Route::get('/', [App\Http\Controllers\PythonVersionController::class, 'index'])->name('update_manager.python.index');
        Route::get('/create', [App\Http\Controllers\PythonVersionController::class, 'create'])->name('update_manager.python.create');
        Route::post('/store', [App\Http\Controllers\PythonVersionController::class, 'store'])->name('update_manager.python.store');
        Route::get('/{pythonVersion}', [App\Http\Controllers\PythonVersionController::class, 'show'])->name('update_manager.python.show');
        Route::delete('/{pythonVersion}', [App\Http\Controllers\PythonVersionController::class, 'destroy'])->name('update_manager.python.destroy');
    });
});

// Public update API endpoints - no authentication required
Route::prefix('updates')->group(function () {
    // Get manifest for a branch
    Route::get('{branch}/update.json', [UpdateApiController::class, 'getManifest'])
        ->name('updates.manifest');

    // Download files
    Route::get('{branch}/{version}/app.zip', [UpdateApiController::class, 'downloadZip'])
        ->name('updates.download.zip');
    Route::get('{branch}/{version}/requirements.txt', [UpdateApiController::class, 'downloadRequirements'])
        ->name('updates.download.requirements');

    // Python downloads
    Route::get('python/{version}/{filename}', [UpdateApiController::class, 'downloadPython'])
        ->name('updates.download.python');
});