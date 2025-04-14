<?php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewErrorOccurredMail extends Mailable
{
    use Queueable, SerializesModels;

    public $deviceId;
    public $errorCode;
    public $ownName;

    public function __construct($deviceId, $errorCode, $ownName = null)
    {
        $this->deviceId = $deviceId;
        $this->errorCode = $errorCode;
        $this->ownName = $ownName;
    }

    public function build()
    {
        $formattedDeviceId = !empty($this->ownName)
            ? $this->ownName . ' (' . $this->deviceId . ')'
            : $this->deviceId;

        $this->deviceId = $formattedDeviceId;

        return $this->subject(__('mail.new_error_occurred.subject', ['device' => $formattedDeviceId]))
            ->view('emails.new_error_occurred')
            ->with([
                'deviceId' => $formattedDeviceId,
                'errorCode' => $this->errorCode,
                'dashboardUrl' => config('app.frontend_url') . '/dashboard',
            ]);
    }
}