<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDeviceErrorStatesTable extends Migration
{
    public function up()
    {
        Schema::create('device_error_states', function (Blueprint $table) {
            $table->string('device_id')->primary();
            $table->smallInteger('current_error_code')->default(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('device_error_states');
    }
}