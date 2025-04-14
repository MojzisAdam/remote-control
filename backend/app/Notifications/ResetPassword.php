<?php
namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPassword extends BaseResetPassword
{
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject(__('mail.Reset Password Notification'))
            ->line(__('mail.You are receiving this email because we received a password reset request for your account.'))
            ->action(__('mail.Reset Password'), $this->resetUrl($notifiable))
            ->line(__('mail.If you did not request a password reset, no further action is required.'));
    }

    protected function resetUrl($notifiable)
    {
        return url(config('app.frontend_url') . '/reset-password/' . $this->token . '?email=' . urlencode($notifiable->email));
    }
}