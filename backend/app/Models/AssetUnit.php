<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssetUnit extends Model
{
    protected $fillable = [
        'asset_id',
        'name',
        'serial_number',
        'specification',
        'status',
        'branch',
        'assigned_to_user_id',
        'received_at',
        'warranty_expiry',
    ];

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }
}
