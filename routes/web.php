<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\NurseController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
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
