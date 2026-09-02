<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    /**************************************************************************/
    /* Processing Hierarchy                                                   */
    /**************************************************************************/
    // $fillable                     (1.0)  Attributes that are mass assignable.
    // $casts                        (2.0)  Attributes casting definitions.
    // user                          (3.0)  The user who receives the
    //                                      notification.

    /**
     * <Layer number> (1.0)
     *
     * <Processing name> $fillable
     * <Function> The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = ['user_id', 'message', 'link', 'read_at'];

    /**
     * <Layer number> (2.0)
     *
     * <Processing name> $casts
     * <Function> The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = ['read_at' => 'datetime'];

    /**
     * <Layer number> (3.0)
     *
     * <Processing name> user
     * <Function> The user who receives the notification.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}