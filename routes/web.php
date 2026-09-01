<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\NurseController;
use App\Http\Controllers\Admin\ShiftTemplateController;
use App\Http\Controllers\Admin\UnitController;
use App\Http\Controllers\Admin\ScheduleController;
use App\Http\Controllers\Admin\TimeOffController as AdminTimeOffController;
use App\Http\Controllers\TimeOffController;
use App\Models\TimeOffRequest;
use App\Models\Unit;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
});

Route::get('/dashboard', function () {
    $user = request()->user();
    $is_admin = $user->role === 'nurse_admin';

    if ($is_admin) {
        return Inertia::render('Dashboard', [
            'stats' => [
                'total_nurses' => User::where('role', 'nurse_staff')->count(),
                'active_nurses' => User::where('role', 'nurse_staff')
                    ->whereHas('nurseProfile', fn ($q) => $q->where('is_active', true))
                    ->count(),
                'units' => Unit::count(),
                'pending_requests' => TimeOffRequest::where('status', 'pending')->count(),
            ],
            'nurses' => User::where('role', 'nurse_staff')->with('nurseProfile.unit')->latest()->take(5)->get(),
            'units_list' => Unit::orderBy('name')->withCount([
                'nurseProfiles as total_count',
                'nurseProfiles as active_count' => fn ($q) => $q->where('is_active', true),
            ])->get(),
            'coverage' => (function () {
                $latest = Schedule::orderByDesc('start_date')->first();

                if (! $latest) {
                    return null;
                }

                $days = $latest->shifts()
                    ->with('nurses')
                    ->where('date', '>=', now()->toDateString())
                    ->orderBy('date')
                    ->get()
                    ->groupBy(fn ($s) => $s->date->toDateString())
                    ->map(fn ($g, $date) => [
                        'date' => $date,
                        'required' => $g->sum('required_nurses'),
                        'assigned' => $g->sum(fn ($s) => $s->nurses->count()),
                    ])
                    ->values()
                    ->take(7);

                return [
                    'schedule_name' => $latest->name,
                    'open_slots' => $days->sum(fn ($d) => max(0, $d['required'] - $d['assigned'])),
                    'days' => $days,
                ];
            })(),
            'pending_time_off' => TimeOffRequest::with('user.nurseProfile.unit')
            ->where('status', 'pending')
            ->orderBy('start_date')
            ->get(),
        ]);
    }

    // 👇 Nurse staff dashboard
    $shifts = $user->shifts()
        ->whereHas('schedule', fn ($q) => $q->where('status', 'published'))
        ->with(['unit', 'schedule'])
        ->where('date', '>=', now()->startOfWeek()->toDateString())
        ->orderBy('date')
        ->orderBy('start_time')
        ->get();

    return Inertia::render('StaffDashboard', [
        'shifts' => $shifts,
        'profile' => [
            'unit' => $user->nurseProfile?->unit?->name,
            'max_weekly_hours' => $user->nurseProfile?->max_weekly_hours ?? 40,
        ],
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/time-off', [TimeOffController::class, 'index'])->name('time-off.index');
    Route::post('/time-off', [TimeOffController::class, 'store'])->name('time-off.store');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/nurses', [NurseController::class, 'index'])->name('nurses.index');
    Route::get('/nurses/create', [NurseController::class, 'create'])->name('nurses.create');
    Route::post('/nurses', [NurseController::class, 'store'])->name('nurses.store');
    Route::get('/nurses/{nurse}/edit', [NurseController::class, 'edit'])->name('nurses.edit');
    Route::put('/nurses/{nurse}', [NurseController::class, 'update'])->name('nurses.update');
    Route::delete('/nurses/{nurse}', [NurseController::class, 'destroy'])->name('nurses.destroy');
    Route::patch('/nurses/{nurse}/toggle', [NurseController::class, 'toggle'])->name('nurses.toggle');
    Route::get('/shift-templates', [ShiftTemplateController::class, 'index'])->name('shift-templates.index');
    Route::post('/shift-templates', [ShiftTemplateController::class, 'store'])->name('shift-templates.store');
    Route::put('/shift-templates/{shift_template}', [ShiftTemplateController::class, 'update'])->name('shift-templates.update');
    Route::delete('/shift-templates/{shift_template}', [ShiftTemplateController::class, 'destroy'])->name('shift-templates.destroy');
    Route::get('/units', [UnitController::class, 'index'])->name('units.index');
    Route::post('/units', [UnitController::class, 'store'])->name('units.store');
    Route::put('/units/{unit}', [UnitController::class, 'update'])->name('units.update');
    Route::delete('/units/{unit}', [UnitController::class, 'destroy'])->name('units.destroy');
    Route::get('/schedules', [ScheduleController::class, 'index'])->name('schedules.index');
    Route::post('/schedules', [ScheduleController::class, 'store'])->name('schedules.store');
    Route::get('/schedules/{schedule}', [ScheduleController::class, 'show'])->name('schedules.show');
    Route::patch('/schedules/{schedule}/publish', [ScheduleController::class, 'publish'])->name('schedules.publish');
    Route::post('/shifts/{shift}/assign', [ScheduleController::class, 'assign'])->name('shifts.assign');
    Route::delete('/shifts/{shift}/nurses/{nurse}', [ScheduleController::class, 'unassign'])->name('shifts.unassign');
    Route::get('/time-off', [AdminTimeOffController::class, 'index'])->name('time-off.index');
    Route::patch('/time-off/{timeOffRequest}/approve', [AdminTimeOffController::class, 'approve'])->name('time-off.approve');
    Route::patch('/time-off/{timeOffRequest}/reject', [AdminTimeOffController::class, 'reject'])->name('time-off.reject');
});

require __DIR__.'/auth.php';