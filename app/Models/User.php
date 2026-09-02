<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;  
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**************************************************************************/
    /* Processing Hierarchy                                                   */
    /**************************************************************************/
    // $fillable                     (1.0)  Attributes that are mass assignable.
    // $hidden                       (2.0)  Attributes hidden for serialization.
    // casts                         (3.0)  Attribute casting definitions.
    // nurseProfile                  (4.0)  The nurse profile associated with
    //                                      the user.
    // isAdmin                       (5.0)  Check if the user has admin role.
    // shifts                        (6.0)  The shifts assigned to the user.
    // timeOffRequests               (7.0)  Time-off requests submitted by the
    //                                      user.
    // notifications                 (8.0)  Notifications for the user.

    /**
     * <Layer number> (1.0)
     *
     * <Processing name> $fillable
     * <Function> The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * <Layer number> (2.0)
     *
     * <Processing name> $hidden
     * <Function> The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * <Layer number> (3.0)
     *
     * <Processing name> casts
     * <Function> Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * <Layer number> (4.0)
     *
     * <Processing name> nurseProfile
     * <Function> The nurse profile associated with the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function nurseProfile(): HasOne
    {
        return $this->hasOne(NurseProfile::class);
    }

    /**
     * <Layer number> (5.0)
     *
     * <Processing name> isAdmin
     * <Function> Check if the user has the nurse admin role.
     *
     * @return bool
     */
    public function isAdmin(): bool
    {
        return $this->role === 'nurse_admin';
    }

    /**
     * <Layer number> (6.0)
     *
     * <Processing name> shifts
     * <Function> The shifts assigned to the user through the shift_nurse pivot.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function shifts(): BelongsToMany
    {
        return $this->belongsToMany(Shift::class, 'shift_nurse');
    }

    /**
     * <Layer number> (7.0)
     *
     * <Processing name> timeOffRequests
     * <Function> Time-off requests submitted by the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function timeOffRequests(): HasMany
    {
        return $this->hasMany(TimeOffRequest::class);
    }

    /**
     * <Layer number> (8.0)
     *
     * <Processing name> notifications
     * <Function> Notifications for the user (time-off approvals, etc.).
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }
}