<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;   

class NurseProfile extends Model
{
        protected $fillable = ['user_id', 'employee_no', 'unit_id', 'specialization', 'employment_type', 'max_weekly_hours', 'is_active'];

    protected $casts = ['is_active' => 'boolean', 'max_weekly_hours' => 'integer'];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function unit(): BelongsTo { return $this->belongsTo(Unit::class); }
}
