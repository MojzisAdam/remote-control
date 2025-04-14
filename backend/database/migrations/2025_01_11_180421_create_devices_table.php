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
        Schema::create('devices', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('password')->nullable();
            $table->string('ip')->nullable();
            $table->string('display_type')->default(0);
            $table->string('script_version')->nullable();
            $table->string('fw_version')->nullable();
            $table->timestamp('last_activity')->nullable();
            $table->boolean('send_data')->default(false);
            $table->timestamp('send_data_until')->nullable();
            $table->integer('error_code')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('devices');
    }
};