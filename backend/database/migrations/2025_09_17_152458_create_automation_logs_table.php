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
        Schema::create('automation_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('automation_id');
            $table->timestamp('executed_at');
            $table->enum('status', ['success', 'failed', 'skipped', 'partial', 'warning']);
            $table->text('details')->nullable();
            $table->timestamps();

            $table->foreign('automation_id')->references('id')->on('automations')->onDelete('cascade');
            $table->index(['automation_id', 'executed_at']);
            $table->index(['status', 'executed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('automation_logs');
    }
};
