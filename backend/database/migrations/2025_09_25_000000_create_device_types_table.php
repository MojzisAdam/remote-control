<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('device_types', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->json('capabilities');
            $table->json('mqtt_topics')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('device_types');
    }
};