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
        Schema::create('device_parameter_logs', function (Blueprint $table) {
            $table->bigIncrements('id');

            $table->string('device_id');
            $table->foreign('device_id')
                ->references('id')->on('devices')
                ->onDelete('cascade');

            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id')
                ->references('id')->on('users')
                ->onDelete('set null');

            $table->string('email')->nullable();

            $table->string('parameter');
            $table->string('old_value');
            $table->string('new_value');

            $table->timestamp('changed_at')->useCurrent();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('device_parameter_logs');
    }
};