<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class AddWebNotificationsToDeviceUserTable extends Migration
{
    public function up()
    {
        Schema::table('device_user', function (Blueprint $table) {
            $table->boolean('web_notifications')->default(true)->after('notifications');
        });

        // ensure existing rows have it set to true
        DB::table('device_user')->update(['web_notifications' => true]);
    }

    public function down()
    {
        Schema::table('device_user', function (Blueprint $table) {
            $table->dropColumn('web_notifications');
        });
    }
}