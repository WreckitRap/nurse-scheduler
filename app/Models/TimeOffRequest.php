<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimeOffRequest extends Model
{
    protected $fillable = ['user_id', 'start_date', 'end_date', 'reason', 'status', 'decided_by', 'decided_at'];

    protected $casts = ['start_date' => 'date', 'end_date' => 'date', 'decided_at' => 'datetime'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function decider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'decided_by');
    }
}