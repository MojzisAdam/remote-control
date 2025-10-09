<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->string('device_type_id')->nullable()->after('ip');
            $table->foreign('device_type_id')->references('id')->on('device_types')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->dropForeign(['device_type_id']);
            $table->dropColumn(['device_type_id']);
        });
    }
};