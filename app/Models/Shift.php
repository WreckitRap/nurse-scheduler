<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Shift extends Model
{
    /**************************************************************************/
    /* Processing Hierarchy                                                   */
    /**************************************************************************/
    // $fillable                     (1.0)  Attributes that are mass assignable.
    // $casts                        (2.0)  Attributes casting definitions.
    // schedule                      (3.0)  The schedule the shift belongs to.
    // unit                          (4.0)  The unit the shift is assigned to.
    // template                      (5.0)  The shift template the shift was
    //                                      generated from.
    // nurses                        (6.0)  The nurses assigned to the shift.

    /**
     * <Layer number> (1.0)
     *
     * <Processing name> $fillable
     * <Function> The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = ['schedule_id', 'unit_id', 'shift_template_id', 'date', 'start_time', 'end_time', 'required_nurses', 'color'];

    /**
     * <Layer number> (2.0)
     *
     * <Processing name> $casts
     * <Function> The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = ['date' => 'date', 'required_nurses' => 'integer'];

    /**
     * <Layer number> (3.0)
     *
     * <Processing name> schedule
     * <Function> The schedule the shift belongs to.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    /**
     * <Layer number> (4.0)
     *
     * <Processing name> unit
     * <Function> The unit the shift is assigned to.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * <Layer number> (5.0)
     *
     * <Processing name> template
     * <Function> The shift template the shift was generated from.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(ShiftTemplate::class, 'shift_template_id');
    }

    /**
     * <Layer number> (6.0)
     *
     * <Processing name> nurses
     * <Function> The nurses assigned to the shift through the shift_nurse pivot.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function nurses(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'shift_nurse');
    }
}