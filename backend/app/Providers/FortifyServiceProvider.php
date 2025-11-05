<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Actions\Fortify\UpdateUserPassword;
use App\Actions\Fortify\UpdateUserProfileInformation;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Laravel\Fortify\Fortify;
use App\Actions\Fortify\CustomVerifyEmail;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Http\Controllers\AuthenticatedSessionController;
use Laravel\Fortify\Http\Controllers\ConfirmablePasswordController;
use Laravel\Fortify\Http\Controllers\ConfirmedPasswordStatusController;
use Laravel\Fortify\Http\Controllers\ConfirmedTwoFactorAuthenticationController;
use Laravel\Fortify\Http\Controllers\EmailVerificationNotificationController;
use Laravel\Fortify\Http\Controllers\EmailVerificationPromptController;
use Laravel\Fortify\Http\Controllers\NewPasswordController;
use Laravel\Fortify\Http\Controllers\PasswordController;
use Laravel\Fortify\Http\Controllers\PasswordResetLinkController;
use Laravel\Fortify\Http\Controllers\ProfileInformationController;
use Laravel\Fortify\Http\Controllers\RecoveryCodeController;
use Laravel\Fortify\Http\Controllers\RegisteredUserController;
use Laravel\Fortify\Http\Controllers\TwoFactorAuthenticatedSessionController;
use Laravel\Fortify\Http\Controllers\TwoFactorAuthenticationController;
use Laravel\Fortify\Http\Controllers\TwoFactorQrCodeController;
use Laravel\Fortify\Http\Controllers\TwoFactorSecretKeyController;
use Laravel\Fortify\Http\Controllers\VerifyEmailController;
use Laravel\Fortify\RoutePath;
use Laravel\Fortify\Features;


class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        Fortify::ignoreRoutes();
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Fortify::createUsersUsing(CreateNewUser::class);
        Fortify::updateUserProfileInformationUsing(UpdateUserProfileInformation::class);
        Fortify::updateUserPasswordsUsing(UpdateUserPassword::class);
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())) . '|' . $request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });

        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('register', function (Request $request) {
            return Limit::perHour(10)->by($request->ip());
        });

        RateLimiter::for('forgot-password', function (Request $request) {
            $email = $request->input('email', '');
            return Limit::perHour(3)->by($email . '|' . $request->ip());
        });

        RateLimiter::for('verification', function (Request $request) {
            return $request->user()
                ? Limit::perMinute(3)->by($request->user()->id)
                : Limit::perMinute(3)->by($request->ip());
        });

        RateLimiter::for('password-reset', function (Request $request) {
            return Limit::perMinute(3)->by($request->ip());
        });

        RateLimiter::for('password-confirm', function (Request $request) {
            return Limit::perMinute(5)->by($request->user()->id);
        });

        RateLimiter::for('two-factor-management', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()->id);
        });

        RateLimiter::for('logout', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()->id);
        });

        RateLimiter::for('profile-update', function (Request $request) {
            return Limit::perMinute(5)->by($request->user()->id);
        });

        RateLimiter::for('password-update', function (Request $request) {
            return Limit::perMinute(5)->by($request->user()->id);
        });

        $this->app->bind(VerifyEmailController::class, function ($app) {
            return new class extends VerifyEmailController {
                public function __invoke(Request $request)
                {
                    return app(CustomVerifyEmail::class)($request);
                }
            };
        });

        $this->configureRoutes();
    }

    /**
     * Configure Fortify routes.
     */
    protected function configureRoutes(): void
    {
        Route::group([
            'namespace' => 'Laravel\Fortify\Http\Controllers',
            'domain' => config('fortify.domain', null),
            'prefix' => config('fortify.prefix'),
        ], function () {
            Route::group(['middleware' => config('fortify.middleware', ['web'])], function () {
                $enableViews = config('fortify.views', true);

                // Authentication...
                if ($enableViews) {
                    Route::get(RoutePath::for('login', '/login'), [AuthenticatedSessionController::class, 'create'])
                        ->middleware(['guest:' . config('fortify.guard')])
                        ->name('login');
                }

                $limiter = config('fortify.limiters.login');
                $twoFactorLimiter = config('fortify.limiters.two-factor');
                $verificationLimiter = config('fortify.limiters.verification', '6,1');
                $registerLimiter = config('fortify.limiters.register');
                $forgotPasswordLimiter = config('fortify.limiters.forgot-password');
                $passwordResetLimiter = config('fortify.limiters.password-reset');
                $passwordConfirmLimiter = config('fortify.limiters.password-confirm');
                $twoFactorManagementLimiter = config('fortify.limiters.two-factor-management');
                $logoutLimiter = config('fortify.limiters.logout');
                $profileUpdateLimiter = config('fortify.limiters.profile-update');
                $passwordUpdateLimiter = config('fortify.limiters.password-update');

                Route::post(RoutePath::for('login', '/login'), [AuthenticatedSessionController::class, 'store'])
                    ->middleware(array_filter([
                        'guest:' . config('fortify.guard'),
                        $limiter ? 'throttle:' . $limiter : null,
                    ]))->name('login.store');

                Route::post(RoutePath::for('logout', '/logout'), [AuthenticatedSessionController::class, 'destroy'])
                    ->middleware(array_filter([
                        config('fortify.auth_middleware', 'auth') . ':' . config('fortify.guard'),
                        $logoutLimiter ? 'throttle:' . $logoutLimiter : null,
                    ]))
                    ->name('logout');

                // Password Reset...
                if (Features::enabled(Features::resetPasswords())) {
                    if ($enableViews) {
                        Route::get(RoutePath::for('password.request', '/forgot-password'), [PasswordResetLinkController::class, 'create'])
                            ->middleware(['guest:' . config('fortify.guard')])
                            ->name('password.request');

                        Route::get(RoutePath::for('password.reset', '/reset-password/{token}'), [NewPasswordController::class, 'create'])
                            ->middleware(['guest:' . config('fortify.guard')])
                            ->name('password.reset');
                    }

                    Route::post(RoutePath::for('password.email', '/forgot-password'), [PasswordResetLinkController::class, 'store'])
                        ->middleware(array_filter([
                            'guest:' . config('fortify.guard'),
                            $forgotPasswordLimiter ? 'throttle:' . $forgotPasswordLimiter : null,
                        ]))
                        ->name('password.email');

                    Route::post(RoutePath::for('password.update', '/reset-password'), [NewPasswordController::class, 'store'])
                        ->middleware(array_filter([
                            'guest:' . config('fortify.guard'),
                            $passwordResetLimiter ? 'throttle:' . $passwordResetLimiter : null,
                        ]))
                        ->name('password.update');
                }

                // Registration...
                if (Features::enabled(Features::registration())) {
                    if ($enableViews) {
                        Route::get(RoutePath::for('register', '/register'), [RegisteredUserController::class, 'create'])
                            ->middleware(['guest:' . config('fortify.guard')])
                            ->name('register');
                    }

                    Route::post(RoutePath::for('register', '/register'), [RegisteredUserController::class, 'store'])
                        ->middleware(array_filter([
                            'guest:' . config('fortify.guard'),
                            $registerLimiter ? 'throttle:' . $registerLimiter : null,
                        ]))
                        ->name('register.store');
                }

                // Email Verification...
                if (Features::enabled(Features::emailVerification())) {
                    if ($enableViews) {
                        Route::get(RoutePath::for('verification.notice', '/email/verify'), [EmailVerificationPromptController::class, '__invoke'])
                            ->middleware([config('fortify.auth_middleware', 'auth') . ':' . config('fortify.guard')])
                            ->name('verification.notice');
                    }

                    Route::get(RoutePath::for('verification.verify', '/email/verify/{id}/{hash}'), [CustomVerifyEmail::class, '__invoke'])
                        ->middleware(array_filter([
                            'signed',
                            $verificationLimiter ? 'throttle:' . $verificationLimiter : null,
                        ]))
                        ->name('verification.verify');

                    Route::post(RoutePath::for('verification.send', '/email/verification-notification'), [EmailVerificationNotificationController::class, 'store'])
                        ->middleware(array_filter([
                            config('fortify.auth_middleware', 'auth') . ':' . config('fortify.guard'),
                            $verificationLimiter ? 'throttle:' . $verificationLimiter : null,
                        ]))
                        ->name('verification.send');
                }

                // Profile Information...
                if (Features::enabled(Features::updateProfileInformation())) {
                    Route::put(RoutePath::for('user-profile-information.update', '/user/profile-information'), [ProfileInformationController::class, 'update'])
                        ->middleware(array_filter([
                            config('fortify.auth_middleware', 'auth') . ':' . config('fortify.guard'),
                            $profileUpdateLimiter ? 'throttle:' . $profileUpdateLimiter : null,
                        ]))
                        ->name('user-profile-information.update');
                }

                // Passwords...
                if (Features::enabled(Features::updatePasswords())) {
                    Route::put(RoutePath::for('user-password.update', '/user/password'), [PasswordController::class, 'update'])
                        ->middleware(array_filter([
                            config('fortify.auth_middleware', 'auth') . ':' . config('fortify.guard'),
                            $passwordUpdateLimiter ? 'throttle:' . $passwordUpdateLimiter : null,
                        ]))
                        ->name('user-password.update');
                }

                // Password Confirmation...
                if ($enableViews) {
                    Route::get(RoutePath::for('password.confirm', '/user/confirm-password'), [ConfirmablePasswordController::class, 'show'])
                        ->middleware([config('fortify.auth_middleware', 'auth') . ':' . config('fortify.guard')])
                        ->name('password.confirm');
                }

                Route::get(RoutePath::for('password.confirmation', '/user/confirmed-password-status'), [ConfirmedPasswordStatusController::class, 'show'])
                    ->middleware([config('fortify.auth_middleware', 'auth') . ':' . config('fortify.guard')])
                    ->name('password.confirmation');

                Route::post(RoutePath::for('password.confirm', '/user/confirm-password'), [ConfirmablePasswordController::class, 'store'])
                    ->middleware(array_filter([
                        config('fortify.auth_middleware', 'auth') . ':' . config('fortify.guard'),
                        $passwordConfirmLimiter ? 'throttle:' . $passwordConfirmLimiter : null,
                    ]))
                    ->name('password.confirm.store');

                // Two Factor Authentication...
                if (Features::enabled(Features::twoFactorAuthentication())) {
                    if ($enableViews) {
                        Route::get(RoutePath::for('two-factor.login', '/two-factor-challenge'), [TwoFactorAuthenticatedSessionController::class, 'create'])
                            ->middleware(['guest:' . config('fortify.guard')])
                            ->name('two-factor.login');
                    }

                    Route::post(RoutePath::for('two-factor.login', '/two-factor-challenge'), [TwoFactorAuthenticatedSessionController::class, 'store'])
                        ->middleware(array_filter([
                            'guest:' . config('fortify.guard'),
                            $twoFactorLimiter ? 'throttle:' . $twoFactorLimiter : null,
                        ]))->name('two-factor.login.store');

                    $twoFactorMiddleware = array_filter(array_merge(
                        Features::optionEnabled(Features::twoFactorAuthentication(), 'confirmPassword')
                        ? [config('fortify.auth_middleware', 'auth') . ':' . config('fortify.guard'), 'password.confirm']
                        : [config('fortify.auth_middleware', 'auth') . ':' . config('fortify.guard')],
                        [$twoFactorManagementLimiter ? 'throttle:' . $twoFactorManagementLimiter : null]
                    ));

                    Route::post(RoutePath::for('two-factor.enable', '/user/two-factor-authentication'), [TwoFactorAuthenticationController::class, 'store'])
                        ->middleware($twoFactorMiddleware)
                        ->name('two-factor.enable');

                    Route::post(RoutePath::for('two-factor.confirm', '/user/confirmed-two-factor-authentication'), [ConfirmedTwoFactorAuthenticationController::class, 'store'])
                        ->middleware($twoFactorMiddleware)
                        ->name('two-factor.confirm');

                    Route::delete(RoutePath::for('two-factor.disable', '/user/two-factor-authentication'), [TwoFactorAuthenticationController::class, 'destroy'])
                        ->middleware($twoFactorMiddleware)
                        ->name('two-factor.disable');

                    Route::get(RoutePath::for('two-factor.qr-code', '/user/two-factor-qr-code'), [TwoFactorQrCodeController::class, 'show'])
                        ->middleware($twoFactorMiddleware)
                        ->name('two-factor.qr-code');

                    Route::get(RoutePath::for('two-factor.secret-key', '/user/two-factor-secret-key'), [TwoFactorSecretKeyController::class, 'show'])
                        ->middleware($twoFactorMiddleware)
                        ->name('two-factor.secret-key');

                    Route::get(RoutePath::for('two-factor.recovery-codes', '/user/two-factor-recovery-codes'), [RecoveryCodeController::class, 'index'])
                        ->middleware($twoFactorMiddleware)
                        ->name('two-factor.recovery-codes');

                    Route::post(RoutePath::for('two-factor.recovery-codes', '/user/two-factor-recovery-codes'), [RecoveryCodeController::class, 'store'])
                        ->middleware($twoFactorMiddleware);
                }
            });
        });
    }
}