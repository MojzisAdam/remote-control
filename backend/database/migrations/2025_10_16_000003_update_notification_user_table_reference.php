<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        DB::statement('ALTER TABLE notification_user 
            DROP FOREIGN KEY notification_user_user_id_foreign,
            DROP FOREIGN KEY notification_user_notification_id_foreign,
            DROP PRIMARY KEY;');

        DB::statement('ALTER TABLE notification_user
            ADD CONSTRAINT notification_user_user_id_foreign
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            ADD CONSTRAINT notification_user_notification_id_foreign
                FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
            ADD PRIMARY KEY (user_id, notification_id);');

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    public function down()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        DB::statement('ALTER TABLE notification_user 
            DROP FOREIGN KEY notification_user_notification_id_foreign,
            DROP PRIMARY KEY;');

        DB::statement('ALTER TABLE notification_user
            ADD CONSTRAINT notification_user_notification_id_foreign
                FOREIGN KEY (notification_id) REFERENCES device_notifications(id) ON DELETE CASCADE,
            ADD PRIMARY KEY (user_id, notification_id);');

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
};