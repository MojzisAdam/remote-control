<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>{{ config('app.name') }}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #edf2f7;
        }
    </style>
</head>

<body style="margin:0; padding:0; background-color:#edf2f7;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#edf2f7;">
        <tr>
            <td align="center" style="padding:40px 0;">
                <!-- Inner Table -->
                <table width="700" border="0" cellspacing="0" cellpadding="0"
                    style="background-color:#ffffff; border:1px solid #e8e5ef; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                    <tr>
                        <td align="center" style="background-color:#48bb78; padding:20px;">
                            <a href="{{ config('app.url') }}"
                                style="color:#ffffff; font-size:19px; font-weight:bold; text-decoration:none;">
                                {{ config('app.name') }}
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td
                            style="padding:40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#718096;">
                            <h1
                                style="color:#3d4852; font-size:20px; font-weight:bold; margin:0 0 20px 0; text-align:left;">
                                {{ __('mail.error_resolved.heading', ['device' => $deviceId]) }}
                            </h1>
                            <p style="margin:0 0 10px 0; text-align:left;">
                                {{ __('mail.error_resolved.body', ['device' => $deviceId]) }}
                            </p>
                            <p style="margin:0 0 20px 0; text-align:left;">
                                {{ __('mail.error_resolved.support') }}
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center"
                            style="padding:20px; border-top:1px solid #e8e5ef; font-family: sans-serif; font-size:12px; color:#b0adc5;">
                            {{ __('mail.footer') }}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>