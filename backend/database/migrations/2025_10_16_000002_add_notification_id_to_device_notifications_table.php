<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('device_notifications', function (Blueprint $table) {
            $table->foreignId('notification_id')->nullable()->constrained('notifications')->onDelete('cascade');

            // Drop the old notification_type_id column since type is now handled by the base notifications table
            if (Schema::hasColumn('device_notifications', 'notification_type_id')) {
                $table->dropForeign(['notification_type_id']);
                $table->dropColumn('notification_type_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('device_notifications', function (Blueprint $table) {
            // Restore notification_type_id column
            $table->unsignedBigInteger('notification_type_id')->nullable()->after('error_code');
            $table->foreign('notification_type_id')->references('id')->on('notification_types')->onDelete('set null');

            // Drop the notification_id column
            $table->dropForeign(['notification_id']);
            $table->dropColumn('notification_id');
        });
    }
};