<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class NurseController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Nurses/Index', [
            'nurses' => User::where('role', 'nurse_staff')->with('nurseProfile.unit')->latest()->get(),
            'units' => Unit::orderBy('name')->get(['id', 'name']),
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
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'in:nurse_admin,nurse_staff'],
            'employee_no' => ['required', 'string', 'max:50'],
            'unit_id' => ['required', 'exists:units,id'],
            'specialization' => ['nullable', 'string', 'max:255'],
            'employment_type' => ['required', 'in:full_time,part_time,per_diem'],
            'max_weekly_hours' => ['required', 'integer', 'min:1', 'max:80'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
        ]);

        $user->nurseProfile()->create([
            'employee_no' => $data['employee_no'],
            'unit_id' => $data['unit_id'],
            'specialization' => $data['specialization'] ?? null,
            'employment_type' => $data['employment_type'],
            'max_weekly_hours' => $data['max_weekly_hours'],
            'is_active' => true,
        ]);

        return redirect()->route('admin.nurses.index')->with('success', 'Nurse staff created.');
    }

    public function edit(User $nurse): Response
    {
        $nurse->load('nurseProfile');

        return Inertia::render('Admin/Nurses/Edit', [
            'nurse' => $nurse,
            'units' => Unit::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, User $nurse): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email,' . $nurse->id],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['required', 'in:nurse_admin,nurse_staff'],
            'employee_no' => ['required', 'string', 'max:50'],
            'unit_id' => ['required', 'exists:units,id'],
            'specialization' => ['nullable', 'string', 'max:255'],
            'employment_type' => ['required', 'in:full_time,part_time,per_diem'],
            'max_weekly_hours' => ['required', 'integer', 'min:1', 'max:80'],
        ]);

        $nurse->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $data['role'],
            ...($data['password'] ? ['password' => Hash::make($data['password'])] : []),
        ]);

        $nurse->nurseProfile()->updateOrCreate([], [
            'employee_no' => $data['employee_no'],
            'unit_id' => $data['unit_id'],
            'specialization' => $data['specialization'] ?? null,
            'employment_type' => $data['employment_type'],
            'max_weekly_hours' => $data['max_weekly_hours'],
        ]);

        return redirect()->route('admin.nurses.index')->with('success', 'Nurse staff updated.');
    }

    public function toggle(User $nurse): RedirectResponse
    {
        $nurse->nurseProfile()->update(['is_active' => ! $nurse->nurseProfile->is_active]);

        return back()->with('success', 'Nurse status updated.');
    }

    public function destroy(User $nurse): RedirectResponse
    {
        $nurse->nurseProfile()?->delete();
        $nurse->delete();

        return back()->with('success', 'Nurse staff deleted.');
    }
}