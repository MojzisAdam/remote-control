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
        Schema::create('automation_conditions', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['simple', 'time', 'day_of_week'])->default('simple');
            $table->unsignedBigInteger('automation_id');
            $table->string('device_id')->nullable();
            $table->string('field')->nullable();
            $table->enum('operator', ['<', '<=', '=', '>=', '>', '!='])->nullable();
            $table->string('value')->nullable();
            $table->time('time_at')->nullable();
            $table->json('days_of_week')->nullable();
            $table->timestamps();

            $table->foreign('automation_id')->references('id')->on('automations')->onDelete('cascade');
            $table->index(['automation_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('automation_conditions');
    }
};