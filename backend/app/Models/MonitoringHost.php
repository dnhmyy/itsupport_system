<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MonitoringHost extends Model
{
    protected $fillable = [
        'name',
        'type',
        'ip_address',
        'container_name',
        'username',
        'password',
        'status',
        'last_error',
        'last_checked_at',
    ];

    protected $casts = [
        'password' => 'encrypted',
        'last_checked_at' => 'datetime',
    ];

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }
}
