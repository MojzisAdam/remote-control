# Traffic Analytics System for Laravel

This module provides comprehensive traffic analytics for your Laravel application, tracking API usage and providing insights on route popularity, response times, and traffic patterns.

## Features

-   **Automatic Request Logging**: Tracks all API requests via middleware
-   **Data Visualization**: Charts and tables showing traffic patterns and most used routes
-   **Performance Monitoring**: Identifies slow routes by tracking response times
-   **User and IP Tracking**: See which users or IPs generate the most traffic
-   **Automatic Data Pruning**: Keeps your database optimized by removing old logs

## Installation

The system is already integrated into your application. To get started:

1. Run the migration to create the traffic logs table:

```bash
php artisan migrate
```

2. The middleware is already registered in `bootstrap/app.php` and will automatically begin logging API traffic.

3. Access the dashboard at `/admin/traffic` (requires authentication and admin role).

## Usage

### Dashboard

The dashboard provides several views of your traffic data:

-   **Traffic Volume Chart**: See traffic patterns over time
-   **Most Visited Routes**: Identify your most popular endpoints
-   **Slowest Routes**: Find endpoints that may need optimization
-   **Top IP Addresses**: Monitor for potential abuse or high-volume users

You can filter data by different time periods:

-   Hour
-   Day
-   Week
-   Month

### Maintenance

The system includes automatic pruning of old logs to keep your database performant. By default, logs older than 30 days are removed daily.

To manually prune logs:

```bash
# Keep the default 30 days of logs
php artisan traffic:prune

# Specify a custom retention period
php artisan traffic:prune --days=14
```

### Customization

You can customize the excluded routes by editing `app/Http/Middleware/TrafficAnalyticsMiddleware.php` and modifying the `$excludedRoutes` array.

## Performance Considerations

If you experience performance issues due to high traffic volume:

1. Consider running the traffic logging on a queue by modifying the middleware to dispatch a job
2. Increase the pruning frequency or reduce the retention period
3. Consider archiving data instead of deleting it completely

## Security

The analytics dashboard is protected by:

1. Authentication requirement
2. Role-based access control (admin role required)

Make sure to maintain these protections to keep your traffic data secure.
