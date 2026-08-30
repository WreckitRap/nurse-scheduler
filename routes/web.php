<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\NurseController;
use App\Models\Unit;
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
    Route::patch('/nurses/{nurse}/toggle', [NurseController::class, 'toggle'])->name('nurses.toggle');
});

require __DIR__.'/auth.php';