<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('device_history', function (Blueprint $table) {
            $table->string('device_id');
            $table->timestamp('cas')->useCurrent();
            $table->float('TS1')->nullable();
            $table->float('TS2')->nullable();
            $table->float('TS3')->nullable();
            $table->float('TS4')->nullable();
            $table->float('TS5')->nullable();
            $table->float('TS6')->default(-128);
            $table->float('TS7')->default(-128);
            $table->float('TS8')->default(-128);
            $table->float('TS9')->default(-128);
            $table->float('PTO')->nullable();
            $table->float('PTUV')->nullable();
            $table->float('PTO2')->nullable();
            $table->tinyInteger('komp')->nullable();
            $table->float('kvyk')->nullable();
            $table->tinyInteger('run')->nullable();
            $table->tinyInteger('reg')->nullable();
            $table->tinyInteger('vjedn')->nullable();
            $table->tinyInteger('dzto')->nullable();
            $table->tinyInteger('dztuv')->nullable();
            $table->tinyInteger('tstat')->nullable();
            $table->tinyInteger('hdo')->nullable();
            $table->tinyInteger('obd')->nullable();
            $table->tinyInteger('chyba')->nullable();
            $table->float('PT')->nullable();
            $table->float('PPT')->nullable();
            $table->float('RPT')->nullable();
            $table->float('Prtk')->nullable();
            $table->float('TpnVk')->nullable();

            $table->index('device_id');
            $table->primary(['device_id', 'cas']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_history');
    }
};