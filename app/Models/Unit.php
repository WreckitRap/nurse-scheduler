<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unit extends Model
{
    /**************************************************************************/
    /* Processing Hierarchy                                                   */
    /**************************************************************************/
    // $fillable                     (1.0)  Attributes that are mass assignable.
    // nurseProfiles                 (2.0)  The nurse profiles associated with
    //                                      the unit.

    /**
     * <Layer number> (1.0)
     *
     * <Processing name> $fillable
     * <Function> The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = ['name', 'code', 'description'];

    /**
     * <Layer number> (2.0)
     *
     * <Processing name> nurseProfiles
     * <Function> The nurse profiles associated with the unit.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function nurseProfiles(): HasMany
    {
        return $this->hasMany(NurseProfile::class, 'unit_id');
    }
}