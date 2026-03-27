<?php
namespace App\Traits;

use Illuminate\Support\Facades\DB;

trait BatchDeletes
{
    /**
     * Delete rows older than $cutoff in batches.
     *
     * Two strategies depending on whether the table has a single auto-increment PK:
     *
     * A) cursorColumn provided (default 'id'):
     *    Cursor-based — SELECT ids WHERE id > $lastId, then DELETE WHERE IN.
     *    Never re-scans already-processed rows. Use for tables with a single PK.
     *    Requires a composite index on (dateColumn, cursorColumn).
     *
     * B) cursorColumn = null:
     *    LIMIT-based — DELETE WHERE dateColumn < cutoff LIMIT N, repeated.
     *    Re-scans from the start each iteration but terminates correctly as rows
     *    are removed. Use for tables with composite PKs (no single id column).
     *    Requires an index on dateColumn.
     */
    protected function batchDelete(
        string $table,
        string $dateColumn,
        \DateTimeInterface $cutoff,
        int $batchSize = 5_000,
        int $sleepMicroseconds = 0,
        ?string $cursorColumn = 'id',  // null = composite PK table
    ): int {
        return $cursorColumn !== null
            ? $this->batchDeleteWithCursor($table, $dateColumn, $cutoff, $batchSize, $sleepMicroseconds, $cursorColumn)
            : $this->batchDeleteWithLimit($table, $dateColumn, $cutoff, $batchSize, $sleepMicroseconds);
    }

    private function batchDeleteWithCursor(
        string $table,
        string $dateColumn,
        \DateTimeInterface $cutoff,
        int $batchSize,
        int $sleepMicroseconds,
        string $cursorColumn,
    ): int {
        $lastId = 0;
        $deletedTotal = 0;

        do {
            $ids = DB::table($table)
                ->where($dateColumn, '<', $cutoff)
                ->where($cursorColumn, '>', $lastId)
                ->orderBy($cursorColumn)
                ->limit($batchSize)
                ->pluck($cursorColumn);

            if ($ids->isEmpty()) {
                break;
            }

            $deletedTotal += DB::table($table)
                ->whereIn($cursorColumn, $ids)
                ->delete();

            $lastId = $ids->last();

            if ($sleepMicroseconds > 0) {
                usleep($sleepMicroseconds);
            }
        } while (true);

        return $deletedTotal;
    }

    private function batchDeleteWithLimit(
        string $table,
        string $dateColumn,
        \DateTimeInterface $cutoff,
        int $batchSize,
        int $sleepMicroseconds,
    ): int {
        $deletedTotal = 0;

        do {
            $deleted = DB::table($table)
                ->where($dateColumn, '<', $cutoff)
                ->limit($batchSize)
                ->delete();

            $deletedTotal += $deleted;

            if ($deleted > 0 && $sleepMicroseconds > 0) {
                usleep($sleepMicroseconds);
            }
        } while ($deleted > 0);

        return $deletedTotal;
    }
}