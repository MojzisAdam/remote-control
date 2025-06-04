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
        Schema::create('update_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('update_branches')->onDelete('cascade');
            $table->string('version'); // Semantic version (e.g. "3.0.0")
            $table->timestamp('release_date');
            $table->string('checksum'); // SHA-256/SHA-512 checksum
            $table->string('zip_url'); // Public URL for downloading the ZIP
            $table->string('requirements_url')->nullable(); // URL to requirements.txt
            $table->text('release_notes')->nullable();
            $table->boolean('is_current')->default(false); // Whether this is the latest version for the branch
            $table->timestamps();

            // Ensure we don't have duplicate versions within a branch
            $table->unique(['branch_id', 'version']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('update_versions');
    }
};
