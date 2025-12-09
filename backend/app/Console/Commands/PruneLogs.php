<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PruneLogs extends Command
{
    protected $signature = 'logs:prune';
    protected $description = 'Deletes old log records from traffic, automation and device history tables.';

    // Retention settings
    private array $retention = [
        'traffic_logs' => [
            'months' => 1,
            'column' => 'created_at',
        ],
        'automation_logs' => [
            'months' => 3,
            'column' => 'created_at',
        ],
        'device_history' => [
            'months' => 12,
            'column' => 'cas',
        ],
        'device_history_daitsu' => [
            'months' => 12,
            'column' => 'cas',
        ],
    ];

    private int $batchSize = 50_000;

    public function handle()
    {
        foreach ($this->retention as $table => $config) {

            $months = $config['months'];
            $column = $config['column'];

            $this->info("Processing table: {$table} (retention: {$months} months, column: {$column})");

            $deleteBefore = now()->subMonths($months)->startOfDay();

            $this->info("  - Deleting rows where {$column} < {$deleteBefore}");

            $this->pruneTable($table, $column, $deleteBefore);
        }

        $this->info("Log pruning completed successfully.");
        return Command::SUCCESS;
    }

    private function pruneTable(string $table, string $column, $deleteBefore)
    {
        do {
            $deleted = DB::table($table)
                ->where($column, '<', $deleteBefore)
                ->limit($this->batchSize)
                ->delete();

            if ($deleted > 0) {
                $this->info("  - Deleted {$deleted} rows...");
            }

        } while ($deleted > 0);
    }
}