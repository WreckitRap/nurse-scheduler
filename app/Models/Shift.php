<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Shift extends Model
{
    protected $fillable = ['schedule_id', 'unit_id', 'shift_template_id', 'date', 'start_time', 'end_time', 'required_nurses', 'color'];

    protected $casts = ['date' => 'date', 'required_nurses' => 'integer'];

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(ShiftTemplate::class, 'shift_template_id');
    }

    public function nurses(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'shift_nurse');
    }
}