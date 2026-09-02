<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Schedule extends Model
{
    /**************************************************************************/
    /* Processing Hierarchy                                                   */
    /**************************************************************************/
    // $fillable                     (1.0)  Attributes that are mass assignable.
    // $casts                        (2.0)  Attributes casting definitions.
    // shifts                        (3.0)  The shifts generated within the
    //                                      schedule.

    /**
     * <Layer number> (1.0)
     *
     * <Processing name> $fillable
     * <Function> The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = ['name', 'start_date', 'end_date', 'status', 'created_by'];

    /**
     * <Layer number> (2.0)
     *
     * <Processing name> $casts
     * <Function> The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = ['start_date' => 'date', 'end_date' => 'date'];

    /**
     * <Layer number> (3.0)
     *
     * <Processing name> shifts
     * <Function> The shifts generated within the schedule.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function shifts(): HasMany
    {
        return $this->hasMany(Shift::class);
    }
}