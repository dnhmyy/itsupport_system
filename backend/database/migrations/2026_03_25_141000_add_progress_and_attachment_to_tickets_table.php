<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->unsignedTinyInteger('progress_percentage')->default(0)->after('status');
            $table->string('attachment_path')->nullable()->after('monitoring_host_id');
            $table->string('attachment_original_name')->nullable()->after('attachment_path');
            $table->string('attachment_mime_type')->nullable()->after('attachment_original_name');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn([
                'progress_percentage',
                'attachment_path',
                'attachment_original_name',
                'attachment_mime_type',
            ]);
        });
    }
};
