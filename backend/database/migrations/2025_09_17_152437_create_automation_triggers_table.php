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
        Schema::create('automation_triggers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('automation_id');
            $table->enum('type', ['time', 'interval', 'mqtt', 'state_change']);

            // For time-based triggers
            $table->time('time_at')->nullable();
            $table->json('days_of_week')->nullable();
            $table->unsignedInteger('interval_seconds')->nullable();

            // For state change triggers 
            $table->string('device_id')->nullable();
            $table->string('field')->nullable();
            $table->string('operator')->nullable();
            $table->string('value')->nullable();

            $table->timestamps();

            $table->foreign('automation_id')->references('id')->on('automations')->onDelete('cascade');
            $table->index(['automation_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('automation_triggers');
    }
};