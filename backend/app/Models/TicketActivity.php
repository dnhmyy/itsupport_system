<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketActivity extends Model
{
    protected $fillable = ['ticket_id', 'user_id', 'type', 'activity', 'status_to', 'progress_to'];

    protected $casts = [
        'progress_to' => 'integer',
    ];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
