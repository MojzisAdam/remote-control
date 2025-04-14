<?php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ErrorResolvedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $deviceId;
    public $ownName;

    public function __construct($deviceId, $ownName = null)
    {
        $this->deviceId = $deviceId;
        $this->ownName = $ownName;
    }

    public function build()
    {
        $formattedDeviceId = !empty($this->ownName)
            ? $this->ownName . ' (' . $this->deviceId . ')'
            : $this->deviceId;

        $this->deviceId = $formattedDeviceId;

        return $this->subject(__('mail.error_resolved.subject', ['device' => $formattedDeviceId]))
            ->view('emails.error_resolved')
            ->with(['deviceId' => $formattedDeviceId]);
    }
}