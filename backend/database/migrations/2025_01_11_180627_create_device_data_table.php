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
        Schema::create('device_data', function (Blueprint $table) {
            $table->id();
            $table->string('device_id');

            $table->float('TS1')->nullable();
            $table->float('TS2')->nullable();
            $table->float('TS3')->nullable();
            $table->float('TS4')->nullable();
            $table->float('TS5')->nullable();
            $table->float('TS6')->nullable();
            $table->float('TS7')->nullable();
            $table->float('TS8')->nullable();
            $table->float('PTO')->nullable();
            $table->float('PTUV')->nullable();
            $table->tinyInteger('DZTO')->nullable();
            $table->tinyInteger('DZTUV')->nullable();
            $table->tinyInteger('rezim_reg')->nullable();
            $table->tinyInteger('stav_venk_jed')->nullable();
            $table->tinyInteger('stav_termostat')->nullable();
            $table->tinyInteger('stav_hdo')->nullable();
            $table->tinyInteger('stav_sezona')->nullable();
            $table->tinyInteger('stav_komp')->nullable();
            $table->float('vykon_komp')->nullable();
            $table->tinyInteger('cislo_chyby')->nullable();
            $table->smallInteger('TO_cislo_krivky')->nullable();
            $table->smallInteger('TO_posun_krivky')->nullable();
            $table->smallInteger('TO_manualni_tep')->nullable();
            $table->smallInteger('TUV')->nullable();
            $table->smallInteger('TUV_tep')->nullable();
            $table->smallInteger('TUV_l_z')->nullable();
            $table->smallInteger('l_z_funkce')->nullable();
            $table->tinyInteger('TO_68')->nullable();
            $table->tinyInteger('TO_75')->nullable();
            $table->tinyInteger('TO_76')->nullable();
            $table->tinyInteger('TO_77')->nullable();
            $table->tinyInteger('TO_78')->nullable();
            $table->tinyInteger('TUV_99')->nullable();
            $table->tinyInteger('TUV_108')->nullable();
            $table->tinyInteger('TUV_109')->nullable();
            $table->tinyInteger('TUV_110')->nullable();
            $table->tinyInteger('TUV_111')->nullable();
            $table->tinyInteger('DZ_128')->nullable();
            $table->tinyInteger('DZ_133')->nullable();
            $table->float('RT_193')->nullable();
            $table->float('RT_195')->nullable();
            $table->tinyInteger('reg_66')->nullable();
            $table->tinyInteger('reg_192')->nullable();
            $table->float('reg_681')->nullable();
            $table->float('reg_707')->nullable();
            $table->float('reg_745')->nullable();
            $table->float('reg_746')->nullable();
            $table->float('reg_humidity')->nullable();
            $table->integer('fhi')->default(1);

            $table->timestamps();
            $table->foreign('device_id')->references('id')->on('devices')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('device_data');
    }
};