<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('device_history', function (Blueprint $table) {
            $table->dropIndex('device_history_device_id_index');
        });

        Schema::table('device_history_daitsu', function (Blueprint $table) {
            $table->dropIndex('device_history_daitsu_device_id_index');
        });
    }

    public function down(): void
    {
        Schema::table('device_history', function (Blueprint $table) {
            $table->index('device_id', 'device_history_device_id_index');
        });

        Schema::table('device_history_daitsu', function (Blueprint $table) {
            $table->index('device_id', 'device_history_daitsu_device_id_index');
        });
    }
};