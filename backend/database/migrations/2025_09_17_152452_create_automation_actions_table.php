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
        Schema::create('automation_actions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('automation_id');
            $table->enum('type', ['mqtt_publish', 'notify', 'log', 'device_control']);

            // For device control actions
            $table->string('device_id')->nullable();
            $table->string('field')->nullable();
            $table->string('value')->nullable();

            // For notification actions
            $table->string('notification_title')->nullable();
            $table->text('notification_message')->nullable();

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
        Schema::dropIfExists('automation_actions');
    }
};