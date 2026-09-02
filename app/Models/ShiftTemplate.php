<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShiftTemplate extends Model
{
    /**************************************************************************/
    /* Processing Hierarchy                                                   */
    /**************************************************************************/
    // $fillable                     (1.0)  Attributes that are mass assignable.
    // $casts                        (2.0)  Attributes casting definitions.
    // unit                          (3.0)  The unit associated with the shift
    //                                      template.

    /**
     * <Layer number> (1.0)
     *
     * <Processing name> $fillable
     * <Function> The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = ['name', 'unit_id', 'start_time', 'end_time', 'required_nurses', 'color', 'is_active'];

    /**
     * <Layer number> (2.0)
     *
     * <Processing name> $casts
     * <Function> The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = ['is_active' => 'boolean', 'required_nurses' => 'integer'];

    /**
     * <Layer number> (3.0)
     *
     * <Processing name> unit
     * <Function> The unit associated with the shift template.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }
}