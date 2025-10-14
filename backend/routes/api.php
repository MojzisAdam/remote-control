<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RemoteControlApiController;
use App\Http\Controllers\RpiController;
use App\Http\Controllers\AutomationController;
use App\Http\Controllers\AutomationRunnerController;
use App\Http\Controllers\DeviceTypeController;


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/language', [AuthController::class, 'updateLanguage']);
    Route::get('/user/check-force-password-change', [AuthController::class, 'checkForcePasswordChange']);
    Route::post('/user/update-password', [AuthController::class, 'updateUserPassword']);
    Route::get('/devices', [DeviceController::class, 'listUserDevices']);
    Route::post('/devices/add', [DeviceController::class, 'addDevice']);
    Route::get('/devices/favorites', [DeviceController::class, 'getFavoriteDevices']);
    Route::get('/devices/status-summary', [DeviceController::class, 'getDeviceStatusSummary']);
    Route::post('/devices/update-favourite-order', [DeviceController::class, 'updateFavouriteOrder']);

    Route::put('/user/last-visited-device', [UserManagementController::class, 'updateLastVisitedDevice']);
    Route::get('/user/last-visited-device', [UserManagementController::class, 'getLastVisitedDevice']);
    Route::put('/user/toggle-display-last-visited-device', [UserManagementController::class, 'toggleDisplayLastVisitedDevice']);
    Route::get('/user/display-last-visited-device', [UserManagementController::class, 'getDisplayLastVisitedDevice']);

    Route::get('/notifications', [NotificationController::class, 'getUserNotifications']);
    Route::put('/notifications/{notificationId}/mark-as-seen', [NotificationController::class, 'markNotificationAsSeen']);
    Route::get('/notifications/unseen', [NotificationController::class, 'getUnseenNotifications']);
    Route::put('/notifications/mark-all-seen', [NotificationController::class, 'markAllNotificationsAsSeen']);

    Route::get('/device-types', [DeviceTypeController::class, 'index']);
    Route::get('/device-types/{id}', [DeviceTypeController::class, 'show']);
    Route::get('/device-types/{typeId}/devices', [DeviceTypeController::class, 'getDevices']);
    Route::get('/devices/{deviceId}/capabilities', [DeviceTypeController::class, 'getDeviceCapabilities']);
});

Route::middleware(['auth:sanctum', 'permission:manage-automations'])->group(function () {
    Route::get('/automations/stats', [AutomationController::class, 'stats']);
    Route::apiResource('automations', AutomationController::class);
    Route::put('/automations/{automation}/toggle', [AutomationController::class, 'toggle']);
    Route::get('/automations/{automation}/logs', [AutomationController::class, 'logs']);
    Route::get('/automations/{automation}/logs/stats', [AutomationController::class, 'logsStats']);
});


Route::middleware(['auth:sanctum', 'permission:manage-device-types'])->group(function () {
    Route::post('/device-types', [DeviceTypeController::class, 'store']);
    Route::put('/device-types/{id}', [DeviceTypeController::class, 'update']);
    Route::patch('/device-types/{id}', [DeviceTypeController::class, 'update']);
    Route::delete('/device-types/{id}', [DeviceTypeController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'device.ownership'])->group(function () {
    Route::get('/devices/{deviceId}', [DeviceController::class, 'getUserDevice']);
    Route::put('/devices/{deviceId}', [DeviceController::class, 'updateUserDevice']);
    Route::delete('/devices/{deviceId}', [DeviceController::class, 'removeUserDevice']);
    Route::put('/devices/{deviceId}/description', [DeviceController::class, 'updateDeviceDescription']);

    Route::get('/device-history/{deviceId}', [HistoryController::class, 'getDeviceHistory']);
    Route::post('/device-history/{deviceId}/custom-graph', [HistoryController::class, 'getCustomGraphData']);
    Route::get('/temperatures/monthly-average/{deviceId}', [HistoryController::class, 'getMonthlyAverageTemperatures']);

    Route::post('/remote-control/{deviceId}/start-session', [RemoteControlApiController::class, 'startSession']);
    Route::get('/remote-control/{deviceId}/check-connection', [RemoteControlApiController::class, 'checkConnection']);
    Route::get('/remote-control/{deviceId}/data', [RemoteControlApiController::class, 'getDeviceData']);
    Route::post('/remote-control/{deviceId}/update-parameter', [RemoteControlApiController::class, 'updateParameter']);
    Route::post('/remote-control/{deviceId}/end-session', [RemoteControlApiController::class, 'endSession']);

    Route::post('/device/{deviceId}/log-parameter-change', [DeviceController::class, 'logParameterChange']);
    Route::get('/device/{deviceId}/parameter-logs', [DeviceController::class, 'getParameterLogs']);

    Route::put('/devices/{deviceId}/versions', [DeviceController::class, 'updateVersions']);

    Route::get('/notifications/device/{deviceId}', [NotificationController::class, 'getDeviceNotifications']);
    Route::put('/notifications/device/{deviceId}/mark-all-seen', [NotificationController::class, 'markDeviceNotificationsAsSeen']);
});

Route::middleware(['auth:sanctum', 'permission:view-history'])->group(function () {
    Route::put('/custom-graphs/{graphId}', [HistoryController::class, 'updateCustomGraph']);
    Route::delete('/custom-graphs/{graphId}', [HistoryController::class, 'deleteCustomGraph']);
});

Route::middleware(['auth:sanctum', 'device.ownership', 'permission:view-history'])->group(function () {
    Route::get('/hidden-lines/{deviceId}', [HistoryController::class, 'getHiddenLines']);
    Route::post('/hidden-lines/{deviceId}', [HistoryController::class, 'updateHiddenLines']);
    Route::get('/custom-graphs/{deviceId}', [HistoryController::class, 'getCustomGraphs']);
    Route::post('/custom-graphs/{deviceId}', [HistoryController::class, 'saveCustomGraph']);
    Route::get('/device-history/{deviceId}/paginated', [HistoryController::class, 'paginated']);
});

Route::middleware(['auth:sanctum', 'permission:manage-devices'])->group(function () {
    Route::get('/manage-devices', [DeviceController::class, 'listDevices']);
    Route::get('/manage-devices/summary', [DeviceController::class, 'deviceSummary']);
    Route::get('/devices/{deviceId}/users', [DeviceController::class, 'getDeviceUsers']);
    Route::put('/manage-devices/{deviceId}/description', [DeviceController::class, 'updateDeviceDescription']);
    Route::post('/manage-devices/add', [DeviceController::class, 'addDeviceToList']);
    Route::post('/manage-devices/add-to-user', [DeviceController::class, 'addDeviceToUser']);
});

Route::middleware(['auth:sanctum', 'permission:manage-users'])->group(function () {
    Route::get('/users', [UserManagementController::class, 'index']);
    Route::get('/users/{user}', [UserManagementController::class, 'show']);
    Route::post('/users', [UserManagementController::class, 'store']);
    Route::put('/users/{user}', [UserManagementController::class, 'update']);
    Route::delete('/users/{user}', [UserManagementController::class, 'destroy']);
    Route::post('/users/{user}/reset-password', [UserManagementController::class, 'resetPassword']);
});


Route::get('/email/verify/{id}/{hash}', [App\Actions\Fortify\CustomVerifyEmail::class, '__invoke'])
    ->middleware(['signed'])
    ->name('verification.verify');

Route::post('/reset-password', [\Laravel\Fortify\Http\Controllers\NewPasswordController::class, 'store'])
    ->name('password.update');


Route::post('/devices', [DeviceController::class, 'updateOrCreateDevice'])->middleware('api_key:device');
Route::post('/device-history', [HistoryController::class, 'insertHistory'])->middleware('api_key:history');
Route::post('/device/notify', [NotificationController::class, 'notifyDeviceError'])->middleware('api_key:notify');

// Automation runner routes
Route::middleware('api_key:automation_runner')->group(function () {
    Route::get('/automation-runner/active-automations', [AutomationRunnerController::class, 'getActiveAutomations']);
    Route::post('/automation-runner/log-execution', [AutomationRunnerController::class, 'logExecution']);
    Route::post('/automation-runner/log-batch-execution', [AutomationRunnerController::class, 'logBatchExecution']);
    Route::post('/automation-runner/devices/data', [AutomationRunnerController::class, 'getDevicesData']);
    Route::get('/automation-runner/health', [AutomationRunnerController::class, 'health']);

    Route::get('/automation-runner/device-types', [DeviceTypeController::class, 'index']);

    // MQTT topic management routes
    Route::get('/automation-runner/mqtt-topics', [DeviceTypeController::class, 'getAutomationTopics']);
    Route::get('/automation-runner/device-types/automation-enabled', [DeviceTypeController::class, 'getAutomationEnabledDeviceTypes']);
    Route::get('/automation-runner/device-types/{deviceTypeId}/topics', [DeviceTypeController::class, 'getMqttTopics']);
    Route::get('/automation-runner/device-types/{deviceTypeId}/devices-with-topics', [DeviceTypeController::class, 'getDevicesWithTopics']);
});

Route::post('/261dfg59_4', [RpiController::class, 'handleRequest']);
Route::post('/261dfg59_4.php', [RpiController::class, 'handleRequest']);