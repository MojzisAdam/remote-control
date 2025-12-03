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
        // Add foreign key to device_history table
        Schema::table('device_history', function (Blueprint $table) {
            $table->foreign('device_id')->references('id')->on('devices')->onDelete('cascade');
        });

        // Add foreign key to user_graph_preferences table
        Schema::table('user_graph_preferences', function (Blueprint $table) {
            $table->foreign('device_id')->references('id')->on('devices')->onDelete('cascade');
        });

        // Add foreign key to user_custom_graphs table
        Schema::table('user_custom_graphs', function (Blueprint $table) {
            $table->foreign('device_id')->references('id')->on('devices')->onDelete('cascade');
        });

        // Add foreign key to device_notifications table
        Schema::table('device_notifications', function (Blueprint $table) {
            $table->foreign('device_id')->references('id')->on('devices')->onDelete('cascade');
        });

        // Add foreign key to device_history_daitsu table
        Schema::table('device_history_daitsu', function (Blueprint $table) {
            $table->foreign('device_id')->references('id')->on('devices')->onDelete('cascade');
        });

        // Add foreign key to automation_conditions table
        Schema::table('automation_conditions', function (Blueprint $table) {
            $table->foreign('device_id')->references('id')->on('devices')->onDelete('cascade');
        });

        // Add foreign key to automation_actions table  
        Schema::table('automation_actions', function (Blueprint $table) {
            $table->foreign('device_id')->references('id')->on('devices')->onDelete('cascade');
        });

        // Add foreign key to automation_triggers table
        Schema::table('automation_triggers', function (Blueprint $table) {
            $table->foreign('device_id')->references('id')->on('devices')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop foreign keys in reverse order
        Schema::table('automation_triggers', function (Blueprint $table) {
            $table->dropForeign(['device_id']);
        });

        Schema::table('automation_actions', function (Blueprint $table) {
            $table->dropForeign(['device_id']);
        });

        Schema::table('automation_conditions', function (Blueprint $table) {
            $table->dropForeign(['device_id']);
        });

        Schema::table('device_history_daitsu', function (Blueprint $table) {
            $table->dropForeign(['device_id']);
        });

        Schema::table('device_notifications', function (Blueprint $table) {
            $table->dropForeign(['device_id']);
        });

        Schema::table('user_custom_graphs', function (Blueprint $table) {
            $table->dropForeign(['device_id']);
        });

        Schema::table('user_graph_preferences', function (Blueprint $table) {
            $table->dropForeign(['device_id']);
        });

        Schema::table('device_history', function (Blueprint $table) {
            $table->dropForeign(['device_id']);
        });
    }
};