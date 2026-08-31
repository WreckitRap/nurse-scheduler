<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShiftTemplate extends Model
{
    protected $fillable = ['name', 'unit_id', 'start_time', 'end_time', 'required_nurses', 'color', 'is_active'];

    protected $casts = ['is_active' => 'boolean', 'required_nurses' => 'integer'];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }
}