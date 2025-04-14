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
        Schema::create('device_descriptions', function (Blueprint $table) {
            $table->id();
            $table->string('device_id');
            $table->string(column: 'name')->nullable();
            $table->string('owner')->nullable();
            $table->string('zip_code')->nullable();
            $table->string('city')->nullable();
            $table->string('address')->nullable();
            $table->text('description')->nullable();
            $table->string('outdoor_unit_type')->nullable();
            $table->timestamp('installation_date')->nullable();
            $table->timestamps();

            $table->foreign('device_id')->references('id')->on('devices')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('device_descriptions');
    }
};