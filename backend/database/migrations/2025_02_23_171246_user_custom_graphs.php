<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_custom_graphs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('device_id');
            $table->string('graph_name');
            $table->json('selected_metrics'); 
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_custom_graphs');
    }
};
