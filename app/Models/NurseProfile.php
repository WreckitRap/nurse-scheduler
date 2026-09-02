<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NurseProfile extends Model
{
    /**************************************************************************/
    /* Processing Hierarchy                                                   */
    /**************************************************************************/
    // $fillable                     (1.0)  Attributes that are mass assignable.
    // $casts                        (2.0)  Attributes casting definitions.
    // user                          (3.0)  The user account the profile
    //                                      belongs to.
    // unit                          (4.0)  The unit the nurse is assigned to.

    /**
     * <Layer number> (1.0)
     *
     * <Processing name> $fillable
     * <Function> The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = ['user_id', 'employee_no', 'unit_id', 'specialization', 'avatar', 'employment_type', 'max_weekly_hours', 'is_active'];

    /**
     * <Layer number> (2.0)
     *
     * <Processing name> $casts
     * <Function> The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = ['is_active' => 'boolean', 'max_weekly_hours' => 'integer'];

    /**
     * <Layer number> (3.0)
     *
     * <Processing name> user
     * <Function> The user account the nurse profile belongs to.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * <Layer number> (4.0)
     *
     * <Processing name> unit
     * <Function> The unit the nurse is assigned to.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }
}