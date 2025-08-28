<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TrafficLog;

class CleanupTrafficLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'traffic:cleanup {period=month : The period to keep logs for (week, month, 3months, 6months, year)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up old traffic logs based on the specified period';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $period = $this->argument('period');
        $validPeriods = ['week', 'month', '3months', '6months', 'year'];

        if (!in_array($period, $validPeriods)) {
            $this->error("Invalid period. Valid periods are: " . implode(', ', $validPeriods));
            return 1;
        }

        // Calculate the cutoff date based on the period
        $cutoffDate = match ($period) {
            'week' => now()->subWeek(),
            'month' => now()->subMonth(),
            '3months' => now()->subMonths(3),
            '6months' => now()->subMonths(6),
            'year' => now()->subYear(),
        };

        $this->info("Cleaning up traffic logs older than {$cutoffDate->format('Y-m-d H:i:s')}...");

        // Count logs that will be deleted
        $count = TrafficLog::where('created_at', '<', $cutoffDate)->count();

        if ($count === 0) {
            $this->info("No logs found older than the specified period.");
            return 0;
        }

        if ($this->confirm("This will delete {$count} log entries. Do you want to continue?")) {
            $deletedCount = TrafficLog::where('created_at', '<', $cutoffDate)->delete();
            $this->info("Successfully deleted {$deletedCount} log entries.");
        } else {
            $this->info("Operation cancelled.");
        }

        return 0;
    }
}
