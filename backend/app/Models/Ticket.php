<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Ticket extends Model
{
    protected $fillable = [
        'title',
        'description',
        'priority',
        'status',
        'created_by_user_id',
        'assigned_to_user_id',
        'asset_unit_id',
        'monitoring_host_id',
        'progress_percentage',
        'attachment_path',
        'attachment_original_name',
        'attachment_mime_type',
    ];

    protected $casts = [
        'progress_percentage' => 'integer',
    ];

    protected $appends = [
        'attachment_url',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    public function assetUnit()
    {
        return $this->belongsTo(AssetUnit::class);
    }

    public function monitoringHost()
    {
        return $this->belongsTo(MonitoringHost::class);
    }

    public function activities()
    {
        return $this->hasMany(TicketActivity::class);
    }

    public function getAttachmentUrlAttribute(): ?string
    {
        if (! $this->attachment_path) {
            return null;
        }

        return Storage::disk('public')->url($this->attachment_path);
    }
}
