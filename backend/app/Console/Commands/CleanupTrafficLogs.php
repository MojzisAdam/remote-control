<?php
namespace App\Console\Commands;

use App\Helpers\LogRetentionHelper;
use App\Traits\BatchDeletes;
use Illuminate\Console\Command;

class CleanupTrafficLogs extends Command
{
    use BatchDeletes;

    protected $signature = 'traffic:cleanup
        {period=month : week | month | 3months | 6months | year}
        {--batch-size=5000 : Rows per DELETE batch}
        {--dry-run : Count rows without deleting}';

    protected $description = 'Clean up old traffic logs based on the specified period';

    public function handle(): int
    {
        $period = $this->argument('period');

        if (!in_array($period, LogRetentionHelper::VALID_PERIODS, true)) {
            $this->error('Invalid period. Valid options: ' . implode(', ', LogRetentionHelper::VALID_PERIODS));
            return self::FAILURE;
        }

        $cutoffDate = LogRetentionHelper::cutoffDate($period);
        $batchSize = (int) $this->option('batch-size');

        $this->info("Cutoff date: {$cutoffDate->toDateTimeString()}");

        $count = \DB::table('traffic_logs')
            ->where('created_at', '<', $cutoffDate)
            ->count();

        if ($count === 0) {
            $this->info('No logs found older than the specified period.');
            return self::SUCCESS;
        }

        $this->info("Found {$count} log entries to delete.");

        if ($this->option('dry-run')) {
            $this->warn('Dry-run mode — no rows were deleted.');
            return self::SUCCESS;
        }

        if (!$this->confirm("Delete {$count} log entries?")) {
            $this->info('Operation cancelled.');
            return self::SUCCESS;
        }

        $bar = $this->output->createProgressBar($count);
        $bar->start();

        $deleted = $this->batchDelete(
            table: 'traffic_logs',
            dateColumn: 'created_at',
            cutoff: $cutoffDate,
            batchSize: $batchSize,
            cursorColumn: 'id',
        );

        $bar->finish();
        $this->newLine();
        $this->info("Successfully deleted {$deleted} log entries.");

        return self::SUCCESS;
    }
}