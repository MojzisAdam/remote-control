<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class TrafficLog extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'route',
        'method',
        'ip_address',
        'user_agent',
        'user_id',
        'status_code',
        'response_time',
    ];

    /**
     * Get the user that made the request.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include logs from a specific time period.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $period - 'hour', 'day', 'week', 'month'
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeFromPeriod($query, $period)
    {
        return match ($period) {
            'hour' => $query->where('created_at', '>=', now()->subHour()),
            'day' => $query->where('created_at', '>=', now()->subDay()),
            'week' => $query->where('created_at', '>=', now()->subWeek()),
            'month' => $query->where('created_at', '>=', now()->subMonth()),
            default => $query,
        };
    }

    /**
     * Get the most visited routes.
     *
     * @param string $period - 'hour', 'day', 'week', 'month'
     * @param int $limit
     * @return \Illuminate\Support\Collection
     */
    public static function getMostVisitedRoutes($period = 'day', $limit = 10)
    {
        return static::fromPeriod($period)
            ->select('route', 'method')
            ->selectRaw('count(*) as hits')
            ->groupBy('route', 'method')
            ->orderByDesc('hits')
            ->limit($limit)
            ->get();
    }

    /**
     * Get traffic by time interval.
     *
     * @param string $period - 'hour', 'day', 'week'
     * @param string $interval - 'minute', 'hour', 'day'
     * @return \Illuminate\Support\Collection
     */
    public static function getTrafficByTime($period = 'day', $interval = 'hour')
    {
        $dateFormat = match ($interval) {
            'minute' => '%Y-%m-%d %H:%i:00',
            'hour' => '%Y-%m-%d %H:00:00',
            'day' => '%Y-%m-%d',
            default => '%Y-%m-%d %H:00:00',
        };

        return static::fromPeriod($period)
            ->selectRaw("DATE_FORMAT(created_at, '{$dateFormat}') as time_interval")
            ->selectRaw('count(*) as hits')
            ->groupBy('time_interval')
            ->orderBy('time_interval')
            ->get();
    }
}
