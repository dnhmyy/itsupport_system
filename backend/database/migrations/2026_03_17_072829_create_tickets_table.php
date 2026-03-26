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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->string('priority')->default('medium'); // low, medium, high, critical
            $table->string('status')->default('open'); // open, in_progress, resolved, closed
            $table->foreignId('created_by_user_id')->constrained('users');
            $table->foreignId('assigned_to_user_id')->nullable()->constrained('users');
            $table->foreignId('asset_unit_id')->nullable()->constrained('asset_units');
            $table->foreignId('monitoring_host_id')->nullable()->constrained('monitoring_hosts');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
