<?php

namespace App\Console\Commands;

use App\Models\UpdateBranch;
use App\Services\UpdateManagerService;
use Illuminate\Console\Command;

class CleanupOldUpdateVersions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'updates:cleanup {--keep=5 : Number of versions to keep per branch} {--dry-run : Run without actually deleting files}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up old update versions based on retention policy';

    /**
     * The update manager service instance.
     */
    protected $updateManager;

    /**
     * Create a new command instance.
     *
     * @param UpdateManagerService $updateManager
     */
    public function __construct(UpdateManagerService $updateManager)
    {
        parent::__construct();
        $this->updateManager = $updateManager;
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $keep = (int) $this->option('keep');
        $dryRun = $this->option('dry-run');

        if ($keep < 1) {
            $this->error('Keep value must be at least 1');
            return 1;
        }

        $this->info('Starting cleanup of old update versions');
        if ($dryRun) {
            $this->warn('DRY RUN: No files will be deleted');
        }

        $branches = UpdateBranch::all();
        $totalRemoved = 0;

        foreach ($branches as $branch) {
            $this->info("Processing branch: {$branch->name}");

            // Get versions sorted by release date, newest first
            $versions = $branch->versions()
                ->orderByDesc('release_date')
                ->get();

            if ($versions->count() <= $keep) {
                $this->info("  Branch has {$versions->count()} versions, no cleanup needed (keeping {$keep})");
                continue;
            }

            $versionsToRemove = $versions->slice($keep);
            $this->info("  Found {$versionsToRemove->count()} versions to remove");

            foreach ($versionsToRemove as $version) {
                // Skip current version if it somehow ended up in the list
                if ($version->is_current) {
                    $this->warn("  Skipping current version: {$version->version}");
                    continue;
                }

                $this->info("  Removing version: {$version->version}");

                if (!$dryRun) {
                    if ($this->updateManager->deleteVersion($version)) {
                        $totalRemoved++;
                    } else {
                        $this->error("  Failed to remove version: {$version->version}");
                    }
                } else {
                    $this->line("  [DRY RUN] Would remove version: {$version->version}");
                    $totalRemoved++;
                }
            }
        }

        if ($dryRun) {
            $this->info("DRY RUN completed. Would have removed {$totalRemoved} versions");
        } else {
            $this->info("Cleanup completed. Removed {$totalRemoved} versions");
        }

        return 0;
    }
}
