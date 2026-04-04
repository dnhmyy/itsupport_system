<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('user_push_devices');
    }

    public function down(): void
    {
        // Push device registration was removed from the application.
    }
};
