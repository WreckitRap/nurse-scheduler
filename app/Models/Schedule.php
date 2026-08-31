<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Schedule extends Model
{
    protected $fillable = ['name', 'start_date', 'end_date', 'status', 'created_by'];

    protected $casts = ['start_date' => 'date', 'end_date' => 'date'];

    public function shifts(): HasMany
    {
        return $this->hasMany(Shift::class);
    }
}