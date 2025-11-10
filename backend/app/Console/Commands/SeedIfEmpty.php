<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;

class SeedIfEmpty extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:seed-if-empty';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seeds the database if it is empty (users table)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (!User::exists()) {
            $this->info('No users found, seeding...');
            Artisan::call('db:seed', ['--force' => true]);
            $this->info(Artisan::output());
        } else {
            $this->info('Users already exist, skipping seeding.');
        }
    }
}