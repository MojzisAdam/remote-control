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
            $table->unsignedBigInteger('notification_type_id')->nullable()->after('error_code');
            $table->foreign('notification_type_id')
                ->references('id')->on('notification_types')
                ->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('device_notifications', function (Blueprint $table) {
            $table->dropForeign(['notification_type_id']);
            $table->dropColumn('notification_type_id');
        });
    }
};