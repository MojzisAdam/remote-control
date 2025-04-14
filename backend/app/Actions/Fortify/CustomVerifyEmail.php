<?php

namespace App\Actions\Fortify;

use Illuminate\Auth\Events\Verified;
use Laravel\Fortify\Actions\AttemptToAuthenticate;
use Laravel\Fortify\Actions\EnsureLoginIsNotThrottled;
use Laravel\Fortify\Actions\PrepareAuthenticatedSession;
use Laravel\Fortify\Actions\RedirectIfTwoFactorAuthenticatable;
use Laravel\Fortify\Contracts\VerifyEmailResponse;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;
use App\Models\User;
use Illuminate\Http\Request;

class CustomVerifyEmail
{
    public function __invoke(Request $request)
    {
        $user = User::find($request->route('id'));

        if (!$user) {
            return response()->json(['message' => 'Invalid user ID'], 403);
        }

        if (
            !hash_equals(
                (string) $request->route('hash'),
                sha1($user->getEmailForVerification())
            )
        ) {
            return response()->json(['message' => 'Invalid verification link'], 403);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified']);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return response()->json(['message' => 'Email verified successfully']);
    }
}