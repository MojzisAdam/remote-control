<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Replaces the single created_at index — composite covers both filter + cursor
        Schema::table('traffic_logs', function (Blueprint $table) {
            $table->dropIndex('traffic_logs_created_at_index');
            $table->index(['created_at', 'id'], 'idx_traffic_logs_created_at_id');
        });

        // No created_at index exists at all
        Schema::table('automation_logs', function (Blueprint $table) {
            $table->index(['created_at', 'id'], 'idx_automation_logs_created_at_id');
        });

        // PRIMARY is (device_id, cas) — unusable for cas-only filter
        Schema::table('device_history', function (Blueprint $table) {
            $table->index('cas', 'idx_device_history_cas');
        });

        Schema::table('device_history_daitsu', function (Blueprint $table) {
            $table->index('cas', 'idx_device_history_daitsu_cas');
        });
    }

    public function down(): void
    {
        Schema::table('traffic_logs', function (Blueprint $table) {
            $table->dropIndex('idx_traffic_logs_created_at_id');
            $table->index('created_at', 'traffic_logs_created_at_index');
        });

        Schema::table('automation_logs', function (Blueprint $table) {
            $table->dropIndex('idx_automation_logs_created_at_id');
        });

        Schema::table('device_history', function (Blueprint $table) {
            $table->dropIndex('idx_device_history_cas');
        });

        Schema::table('device_history_daitsu', function (Blueprint $table) {
            $table->dropIndex('idx_device_history_daitsu_cas');
        });
    }
};