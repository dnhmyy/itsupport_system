<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Credential extends Model
{
    protected $fillable = [
        'title',
        'category',
        'username',
        'password',
        'url',
        'notes',
    ];

    protected $casts = [
        'password' => 'encrypted',
    ];
}
