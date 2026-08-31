<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\NurseController;
use App\Http\Controllers\Admin\ShiftTemplateController;
use App\Http\Controllers\Admin\UnitController;
use App\Http\Controllers\Admin\ScheduleController;
use App\Models\Unit;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    $is_admin = request()->user()->role === 'nurse_admin';

    return Inertia::render('Dashboard', [
        'stats' => [
            'total_nurses' => User::where('role', 'nurse_staff')->count(),
            'active_nurses' => User::where('role', 'nurse_staff')
                ->whereHas('nurseProfile', fn ($q) => $q->where('is_active', true))
                ->count(),
            'units' => Unit::count(),
            'pending_requests' => 0,
        ],
        'nurses' => $is_admin
            ? User::where('role', 'nurse_staff')->with('nurseProfile.unit')->latest()->take(5)->get()
            : null,

        'units_list' => $is_admin
            ? Unit::orderBy('name')->withCount([
                'nurseProfiles as total_count',
                'nurseProfiles as active_count' => fn ($q) => $q->where('is_active', true),
            ])->get()
            : null,

        // 👇 NEW: live coverage gaps for the latest schedule
        'coverage' => $is_admin ? (function () {
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
        })() : null,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
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
});

require __DIR__.'/auth.php';