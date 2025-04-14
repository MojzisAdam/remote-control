<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('device_parameter_changes', function (Blueprint $table) {
            $table->string('device_id')->primary();
            $table->tinyInteger('zmena_TO_cislo_krivky')->default(0);
            $table->smallInteger('TO_cislo_krivky')->nullable();
            $table->tinyInteger('zmena_TO_posun_krivky')->default(0);
            $table->smallInteger('TO_posun_krivky')->nullable();
            $table->tinyInteger('zmena_TO_manualni_tep')->default(0);
            $table->smallInteger('TO_manualni_tep')->nullable();
            $table->tinyInteger('zmena_TUV')->default(0);
            $table->smallInteger('TUV')->nullable();
            $table->tinyInteger('zmena_TUV_tep')->default(0);
            $table->smallInteger('TUV_tep')->nullable();
            $table->tinyInteger('zmena_TUV_l_z')->default(0);
            $table->smallInteger('TUV_l_z')->nullable();
            $table->tinyInteger('zmena_l_z_funkce')->default(0);
            $table->smallInteger('l_z_funkce')->nullable();
            $table->tinyInteger('zmena_TO_68')->default(0);
            $table->tinyInteger('TO_68')->nullable();
            $table->tinyInteger('zmena_TO_75')->default(0);
            $table->tinyInteger('TO_75')->nullable();
            $table->tinyInteger('zmena_TO_76')->default(0);
            $table->tinyInteger('TO_76')->nullable();
            $table->tinyInteger('zmena_TO_77')->default(0);
            $table->tinyInteger('TO_77')->nullable();
            $table->tinyInteger('zmena_TO_78')->default(0);
            $table->tinyInteger('TO_78')->nullable();
            $table->tinyInteger('zmena_TUV_99')->default(0);
            $table->tinyInteger('TUV_99')->nullable();
            $table->tinyInteger('zmena_TUV_108')->default(0);
            $table->tinyInteger('TUV_108')->nullable();
            $table->tinyInteger('zmena_TUV_109')->default(0);
            $table->tinyInteger('TUV_109')->nullable();
            $table->tinyInteger('zmena_TUV_110')->default(0);
            $table->tinyInteger('TUV_110')->nullable();
            $table->tinyInteger('zmena_TUV_111')->default(0);
            $table->tinyInteger('TUV_111')->nullable();
            $table->tinyInteger('zmena_DZ_128')->default(0);
            $table->tinyInteger('DZ_128')->nullable();
            $table->tinyInteger('zmena_DZ_133')->default(0);
            $table->tinyInteger('DZ_133')->nullable();
            $table->tinyInteger('zmena_RT_193')->default(0);
            $table->float('RT_193')->nullable();
            $table->tinyInteger('zmena_RT_195')->default(0);
            $table->float('RT_195')->nullable();
            $table->tinyInteger('zmena_history_interval')->default(0);
            $table->tinyInteger('history_interval')->default(1);
            $table->timestamps();

            $table->foreign('device_id')->references('id')->on('devices')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('device_parameter_changes');
    }
};