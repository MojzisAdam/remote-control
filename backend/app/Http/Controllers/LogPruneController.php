<?php
namespace App\Http\Controllers;

use App\Traits\BatchDeletes;

class LogPruneController extends Controller
{
    use BatchDeletes;

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

    public function __invoke()
    {
        set_time_limit(0);

        $results = [];
        $hadError = false;

        foreach ($this->retention as $table => $config) {
            $cutoff = now()->subMonths($config['months'])->startOfDay();

            try {
                $deleted = $this->batchDelete(
                    table: $table,
                    dateColumn: $config['column'],
                    cutoff: $cutoff,
                    cursorColumn: $config['cursor_column'],
                );

                $results[$table] = [
                    'deleted' => $deleted,
                    'cutoff' => $cutoff->toDateTimeString(),
                ];
            } catch (\Throwable $e) {
                $hadError = true;

                \Log::error("LogPruneController: failed pruning {$table}", [
                    'error' => $e->getMessage(),
                    'cutoff' => $cutoff->toDateTimeString(),
                ]);

                $results[$table] = [
                    'deleted' => null,
                    'cutoff' => $cutoff->toDateTimeString(),
                    'error' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'success' => !$hadError,
            'pruned_at' => now()->toDateTimeString(),
            'results' => $results,
        ], $hadError ? 500 : 200);
    }
}