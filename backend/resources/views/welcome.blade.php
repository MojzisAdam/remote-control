<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name', 'Laravel') }} API</title>
    <style>
        :root {
            --primary-color: #007bff;
            --background-color: #f4f7f6;
            --text-color: #333;
            --card-background: #ffffff;
            --border-color: #e0e0e0;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background-color: var(--background-color);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            background-color: var(--card-background);
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            width: 100%;
            padding: 30px;
            text-align: center;
        }

        .logo {
            margin-bottom: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .logo img {
            max-width: 100px;
            height: auto;
        }

        .title {
            color: var(--primary-color);
            margin-bottom: 15px;
            font-size: 24px;
            font-weight: 600;
        }

        .description {
            color: #666;
            margin-bottom: 25px;
            font-size: 16px;
        }

        .api-info {
            background-color: #f8f9fa;
            border-left: 4px solid var(--primary-color);
            padding: 15px;
            margin-bottom: 20px;
            text-align: left;
        }

        .api-details {
            background-color: #f1f3f4;
            border-radius: 5px;
            padding: 15px;
        }

        .api-details p {
            display: flex;
            justify-content: space-between;
        }

        .api-details strong {
            color: #555;
        }

        .api-details .value {
            color: var(--primary-color);
            font-weight: 600;
        }

        .dev-warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin-top: 20px;
            margin-bottom: 20px;
            text-align: left;
        }

        .footer {
            color: #888;
            font-size: 14px;
            margin-top: 20px;
        }

        @media (max-width: 600px) {
            .container {
                padding: 20px;
            }

            .title {
                font-size: 20px;
            }

            .description {
                font-size: 14px;
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="logo">
            <!-- Optional: Add a logo image -->
            {{-- <img src="{{ asset('path/to/logo.png') }}" alt="{{ config('app.name') }} Logo"> --}}
        </div>

        <h1 class="title">{{ config('app.name', 'Laravel') }} API</h1>

        <p class="description">
            Welcome to our API documentation. This application provides robust and secure API endpoints for developers.
        </p>

        <div class="api-info">
            <p>Our API is designed to be simple, efficient, and developer-friendly.</p>
        </div>

        <div class="api-details">
            <p>
                <strong>Base URL:</strong>
                <span class="value">{{ url('/api') }}</span>
            </p>
        </div>

        @if(config('app.env') !== 'production')
            <div class="dev-warning">
                <strong>Development Mode:</strong>
                <p>This is a development environment. Ensure proper security configurations before production deployment.
                </p>
            </div>
        @endif

        <div class="footer">
            <p>Powered by Laravel</p>
        </div>
    </div>
</body>

</html>