<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Asset extends Model
{
    protected $fillable = [
        'type', 
        'brand', 
        'model', 
        'specification'
    ];

    public function units()
    {
        return $this->hasMany(AssetUnit::class);
    }
}
