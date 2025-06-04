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
        Schema::create('python_versions', function (Blueprint $table) {
            $table->id();
            $table->string('version')->unique(); // Python version (e.g. 3.10.4)
            $table->string('display_name'); // Display name (e.g. "Python 3.10.4 for Raspberry Pi")
            $table->string('file_path'); // Path to the Python archive file
            $table->string('url'); // Full URL to download the Python archive
            $table->string('checksum'); // SHA-256 checksum of the file
            $table->bigInteger('file_size')->unsigned(); // Size of the file in bytes
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable(); // Optional notes about this Python version
            $table->timestamps();
        });

        // Add foreign key to update_versions table
        Schema::table('update_versions', function (Blueprint $table) {
            $table->foreignId('python_version_id')->nullable()->after('branch_id')
                ->constrained('python_versions')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('update_versions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('python_version_id');
        });

        Schema::dropIfExists('python_versions');
    }
};
