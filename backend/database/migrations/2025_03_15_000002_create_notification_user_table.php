<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNotificationUserTable extends Migration
{
    public function up()
    {
        Schema::create('notification_user', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('notification_id');
            $table->boolean('seen')->default(false);
            $table->timestamps();

            $table->primary(['user_id', 'notification_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('notification_id')->references('id')->on('device_notifications')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('notification_user');
    }
}