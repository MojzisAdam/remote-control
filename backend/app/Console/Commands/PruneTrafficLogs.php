<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TrafficLog;
use Carbon\Carbon;

class PruneTrafficLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'traffic:prune {--days=30 : Number of days to keep logs}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Prune old traffic logs';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = $this->option('days');
        $cutoffDate = Carbon::now()->subDays($days);

        $this->info("Deleting traffic logs older than {$days} days ({$cutoffDate})");

        $deletedCount = TrafficLog::where('created_at', '<', $cutoffDate)->delete();

        $this->info("Deleted {$deletedCount} traffic logs");
    }
}
