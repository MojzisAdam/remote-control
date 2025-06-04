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
        Schema::create('update_artifacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('version_id')->constrained('update_versions')->onDelete('cascade');
            $table->string('original_filename');
            $table->string('storage_path'); // Path where file is stored
            $table->bigInteger('file_size'); // File size in bytes
            $table->string('file_type'); // File type (ZIP, TXT, etc.)
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('update_artifacts');
    }
};
