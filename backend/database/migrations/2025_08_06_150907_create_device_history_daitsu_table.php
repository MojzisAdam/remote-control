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
        Schema::create('device_history_daitsu', function (Blueprint $table) {
            $table->string('device_id');
            $table->timestamp('cas')->useCurrent();
            $table->float('reg_2')->nullable();
            $table->float('reg_4')->nullable();
            $table->float('reg_100')->nullable();
            $table->float('reg_101')->nullable();
            $table->float('reg_104')->nullable();
            $table->float('reg_105')->nullable();
            $table->float('reg_106')->nullable();
            $table->float('reg_107')->nullable();
            $table->float('reg_108')->nullable();
            $table->float('reg_109')->nullable();
            $table->float('reg_110')->nullable();
            $table->float('reg_111')->nullable();
            $table->float('reg_112')->nullable();
            $table->float('reg_113')->nullable();
            $table->float('reg_115')->nullable();
            $table->float('reg_124')->nullable();
            $table->float('reg_128_1')->nullable();
            $table->float('reg_128_4')->nullable();
            $table->float('reg_128_6')->nullable();
            $table->float('reg_129_0')->nullable();
            $table->float('reg_129_2')->nullable();
            $table->float('reg_129_13')->nullable();
            $table->float('reg_129_14')->nullable();
            $table->float('reg_136')->nullable();
            $table->float('reg_137')->nullable();
            $table->float('reg_138')->nullable();
            $table->float('reg_140')->nullable();

            $table->index('device_id');
            $table->primary(['device_id', 'cas']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('device_history_daitsu');
    }
};