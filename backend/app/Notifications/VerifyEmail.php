<?php
namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Carbon;

class VerifyEmail extends BaseVerifyEmail
{
    protected function verificationUrl($notifiable)
    {
        $userId = $notifiable->id;
        $hash = sha1($notifiable->getEmailForVerification());

        $temporarySignedUrl = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(config('auth.verification.expire', 60)),
            [
                'id' => $userId,
                'hash' => $hash,
            ]
        );
        
        $parsedUrl = parse_url($temporarySignedUrl);
        parse_str($parsedUrl['query'], $queryParams);

        $frontendUrl = config('app.frontend_url') . '/email-verification/' . $userId . '/' . $hash;

        $finalUrl = $frontendUrl . '?' . http_build_query($queryParams);

        return $finalUrl;
    }
}
