<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class CreateUpdatesLink extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'storage:link-updates';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a symbolic link from "public/updates" to "storage/app/updates"';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        // Check if the target directory exists, create if not
        if (!File::exists(storage_path('app/updates'))) {
            File::makeDirectory(storage_path('app/updates'), 0755, true);
        }

        // Create the symbolic link
        if (File::exists(public_path('updates'))) {
            $this->error('The "public/updates" directory already exists.');
            return;
        }

        if (PHP_OS_FAMILY === 'Windows') {
            // On Windows, we need to use mklink /D
            $target = storage_path('app/updates');
            $link = public_path('updates');

            // Convert to Windows path format
            $target = str_replace('/', '\\', $target);
            $link = str_replace('/', '\\', $link);

            // Create the symbolic link using mklink
            exec("mklink /D \"{$link}\" \"{$target}\"");
        } else {
            // On Unix systems, use the symlink function
            File::link(
                storage_path('app/updates'),
                public_path('updates')
            );
        }

        $this->info('The [public/updates] directory has been linked.');
    }
}
