<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class NurseController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Nurses/Index', [
            'nurses' => User::where('role', 'nurse_staff')
                ->with('nurseProfile.unit')
                ->latest()
                ->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Nurses/Create', [
            'units' => Unit::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8'],
            'employee_no' => ['required', 'string', 'max:50', 'unique:nurse_profiles'],
            'unit_id' => ['nullable', 'exists:units,id'],
            'specialization' => ['nullable', 'string', 'max:255'],
            'employment_type' => ['required', 'in:full_time,part_time,agency'],
            'max_weekly_hours' => ['required', 'integer', 'min:1', 'max:80'],
        ]);

        DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'nurse_staff',
            ]);

            $user->nurseProfile()->create([
                'employee_no' => $data['employee_no'],
                'unit_id' => $data['unit_id'] ?? null,
                'specialization' => $data['specialization'] ?? null,
                'employment_type' => $data['employment_type'],
                'max_weekly_hours' => $data['max_weekly_hours'],
            ]);
        });

        return redirect()->route('admin.nurses.index')->with('success', 'Nurse staff account created.');
    }

    public function edit(User $nurse): Response
    {
        abort_if($nurse->isAdmin(), 404);
        $nurse->load('nurseProfile');

        return Inertia::render('Admin/Nurses/Edit', [
            'nurse' => $nurse,
            'units' => Unit::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, User $nurse): RedirectResponse
    {
        abort_if($nurse->isAdmin(), 404);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($nurse->id)],
            'employee_no' => ['required', 'string', 'max:50', Rule::unique('nurse_profiles', 'employee_no')->ignore($nurse->nurseProfile?->id)],
            'unit_id' => ['nullable', 'exists:units,id'],
            'specialization' => ['nullable', 'string', 'max:255'],
            'employment_type' => ['required', 'in:full_time,part_time,agency'],
            'max_weekly_hours' => ['required', 'integer', 'min:1', 'max:80'],
        ]);

        $nurse->update(['name' => $data['name'], 'email' => $data['email']]);

        $nurse->nurseProfile?->update([
            'employee_no' => $data['employee_no'],
            'unit_id' => $data['unit_id'] ?? null,
            'specialization' => $data['specialization'] ?? null,
            'employment_type' => $data['employment_type'],
            'max_weekly_hours' => $data['max_weekly_hours'],
        ]);

        return redirect()->route('admin.nurses.index')->with('success', 'Nurse updated.');
    }

    public function toggle(User $nurse): RedirectResponse
    {
        abort_if($nurse->isAdmin(), 404);

        $profile = $nurse->nurseProfile;
        abort_if(! $profile, 404);

        $profile->update(['is_active' => ! $profile->is_active]);

        return back()->with('success', 'Nurse status updated.');
    }
}