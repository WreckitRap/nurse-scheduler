<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unit extends Model
{
    protected $fillable = ['name', 'code', 'description'];

  

    public function nurseProfiles(): HasMany
    {
        return $this->hasMany(NurseProfile::class, 'unit_id');
    }
}
