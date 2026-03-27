<?php
namespace App\Helpers;

use InvalidArgumentException;

class LogRetentionHelper
{
    public const VALID_PERIODS = ['week', 'month', '3months', '6months', 'year'];

    public static function cutoffDate(string $period): \Illuminate\Support\Carbon
    {
        return match ($period) {
            'week' => now()->subWeek(),
            'month' => now()->subMonth(),
            '3months' => now()->subMonths(3),
            '6months' => now()->subMonths(6),
            'year' => now()->subYear(),
            default => throw new InvalidArgumentException("Invalid period: {$period}"),
        };
    }
}