<?php
namespace App\Console\Commands;

use App\Traits\BatchDeletes;
use Illuminate\Console\Command;

class PruneLogs extends Command
{
    use BatchDeletes;

    protected $signature = 'logs:prune
        {--batch-size=5000 : Rows per DELETE batch}
        {--dry-run : Count rows without deleting}';

    protected $description = 'Delete old records from traffic, automation, and device-history tables.';

    // Central retention config — edit only here
    private array $retention = [
        'traffic_logs' => [
            'months' => 1,
            'column' => 'created_at',
            'cursor_column' => 'id',
        ],
        'automation_logs' => [
            'months' => 3,
            'column' => 'created_at',
            'cursor_column' => 'id',
        ],
        'device_history' => [
            'months' => 12,
            'column' => 'cas',
            'cursor_column' => null,    // composite PK: (device_id, cas)
        ],
        'device_history_daitsu' => [
            'months' => 12,
            'column' => 'cas',
            'cursor_column' => null,    // composite PK: (device_id, cas)
        ],
    ];

    public function handle(): int
    {
        $batchSize = (int) $this->option('batch-size');
        $dryRun = $this->option('dry-run');

        foreach ($this->retention as $table => $config) {
            $cutoff = now()->subMonths($config['months'])->startOfDay();

            $this->info(sprintf(
                'Table: %s  |  retention: %d months  |  column: %s  |  cutoff: %s',
                $table,
                $config['months'],
                $config['column'],
                $cutoff->toDateTimeString(),
            ));

            $count = \DB::table($table)
                ->where($config['column'], '<', $cutoff)
                ->count();

            if ($count === 0) {
                $this->line("  → Nothing to delete.\n");
                continue;
            }

            $this->line("  → {$count} rows eligible for deletion.");

            if ($dryRun) {
                $this->warn("  → Dry-run — skipping.\n");
                continue;
            }

            $deleted = $this->batchDelete(
                table: $table,
                dateColumn: $config['column'],
                cutoff: $cutoff,
                batchSize: $batchSize,
                cursorColumn: $config['cursor_column'],
            );

            $this->info("  → Deleted {$deleted} rows.\n");
        }

        $this->info('Log pruning completed.');
        return self::SUCCESS;
    }
}