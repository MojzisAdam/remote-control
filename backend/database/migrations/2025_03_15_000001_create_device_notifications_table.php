<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDeviceNotificationsTable extends Migration
{
    public function up()
    {
        Schema::create('device_notifications', function (Blueprint $table) {
            $table->id();
            $table->string('device_id');
            $table->smallInteger('error_code');
            $table->text('message')->nullable();
            $table->string('message_key')->nullable();
            $table->json('message_data')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('device_notifications');
    }
}