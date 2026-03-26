<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('monitoring_hosts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // server, docker, mikrotik, ping
            $table->string('ip_address');
            $table->string('username')->nullable();
            $table->text('password')->nullable(); // encrypted
            $table->string('status')->default('unknown'); // up, down, unknown
            $table->text('last_error')->nullable();
            $table->timestamp('last_checked_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monitoring_hosts');
    }
};
