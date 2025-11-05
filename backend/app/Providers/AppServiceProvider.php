<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);

        $this->configureRateLimiting();
    }

    /**
     * Configure the rate limiters for the application.
     */
    protected function configureRateLimiting(): void
    {
        // General API rate limiter 
        RateLimiter::for('api', function (Request $request) {
            return $request->user()
                ? Limit::perMinute(180)->by($request->user()->id)
                : Limit::perMinute(30)->by($request->ip());
        });

        // Device operations 
        RateLimiter::for('device-operations', function (Request $request) {
            return Limit::perMinute(maxAttempts: 100)->by($request->user()->id);
        });

        // History and data retrieval 
        RateLimiter::for('history', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()->id);
        });

        // Administrative actions 
        RateLimiter::for('admin', function (Request $request) {
            return Limit::perMinute(40)->by($request->user()->id);
        });

        // External API (devices uploading data)
        RateLimiter::for('external-api', function (Request $request) {
            $identifier = $request->header('X-API-Key', $request->ip());
            return Limit::perMinute(400)->by($identifier);
        });

        // Automation runner 
        RateLimiter::for('automation-runner', function (Request $request) {
            $identifier = $request->header('X-API-Key', 'automation');
            return Limit::perMinute(600)->by($identifier);
        });

        // Notifications - moderate limit
        RateLimiter::for('notifications', function (Request $request) {
            return Limit::perMinute(50)->by($request->user()->id);
        });
    }
}