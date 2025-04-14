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
            <td align="center" style="padding: 40px 0;">
                <!-- Inner table with fixed width -->
                <table width="700" border="0" cellspacing="0" cellpadding="0"
                    style="background-color:#ffffff; border:1px solid #e8e5ef; border-radius:8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <tr>
                        <td align="center" style="background-color:#2d3748; padding:20px;">
                            <a href="{{ config('app.url') }}"
                                style="color:#ffffff; font-size:19px; font-weight:bold; text-decoration:none;">
                                {{ config('app.name') }}
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:40px; font-family: sans-serif; color:#718096;">
                            <h1
                                style="color:#3d4852; font-size:18px; font-weight:bold; margin:0 0 20px 0; text-align:left;">
                                {{ __('mail.new_error_occurred.heading', ['device' => $deviceId]) }}
                            </h1>
                            <p style="margin:0 0 10px 0; text-align:left;">
                                <strong>{{ __('mail.new_error_occurred.error_code_label') }}:</strong> {{ $errorCode }}
                            </p>
                            <p style="margin:0 0 20px 0; text-align:left;">
                                {{ __('mail.new_error_occurred.body') }}
                            </p>
                            <p style="margin:0 0 20px 0; text-align:left;">
                                {{ __('mail.new_error_occurred.dashboard_text') }}
                            </p>
                            <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin-top:20px;">
                                <tr>
                                    <td align="center" bgcolor="#2d3748" style="border-radius:6px;">
                                        <a href="{{ $dashboardUrl }}"
                                            style="display:block; padding:12px 22px; color:#ffffff; text-decoration:none; font-family: sans-serif; font-size:16px;">
                                            {{ __('mail.new_error_occurred.button_text') }}
                                        </a>
                                    </td>
                                </tr>
                            </table>
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