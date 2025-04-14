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
        Schema::create('device_user', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id');
            $table->string('device_id');
            $table->string('own_name', 100)->nullable();
            $table->boolean('favourite')->default(false);
            $table->smallInteger('favouriteOrder')->default(0);
            $table->boolean('notifications')->default(false);
            $table->timestamps();

            $table->primary(['user_id', 'device_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('device_id')->references('id')->on('devices')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('device_user');
    }
};