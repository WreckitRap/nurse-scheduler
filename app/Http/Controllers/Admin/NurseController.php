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
    /**************************************************************************/
    /* Processing Hierarchy                                                   */
    /**************************************************************************/
    // index                         (1.0)  Display all nurse staff with their
    //                                      profiles and units.
    // create                        (2.0)  Display the form to create a new
    //                                      nurse staff member.
    // store                         (3.0)  Create a new nurse user account and
    //                                      associated professional profile.
    // edit                          (4.0)  Display the form to edit an
    //                                      existing nurse staff member.
    // update                        (5.0)  Update a nurse's user account and
    //                                      professional profile.
    // toggle                        (6.0)  Toggle a nurse's active or inactive
    //                                      status.
    // destroy                       (7.0)  Delete a nurse and their profile.

    /**
     * <Layer number> (1.0)
     *
     * <Processing name> index
     * <Function> Display all nurse staff users with their eager-loaded
     *            professional profiles and assigned units.
     *
     * @return \Inertia\Response
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Nurses/Index', [
            'nurses' => User::where('role', 'nurse_staff')->with('nurseProfile.unit')->latest()->get(),
            'units' => Unit::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * <Layer number> (2.0)
     *
     * <Processing name> create
     * <Function> Display the form for creating a new nurse, passing the list
     *            of available units for assignment.
     *
     * @return \Inertia\Response
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Nurses/Create', [
            'units' => Unit::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * <Layer number> (3.0)
     *
     * <Processing name> store
     * <Function> Validate input, create the user account with a hashed
     *            password, and create the associated nurse profile with an
     *            avatar, employment details, and an active status.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
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
            'avatar' => ['nullable', 'string', 'max:16'],
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
            'avatar' => $data['avatar'] ?? '🧑‍⚕️',
            'is_active' => true,
        ]);

        return redirect()->route('admin.nurses.index')->with('success', 'Nurse staff created.');
    }

    /**
     * <Layer number> (4.0)
     *
     * <Processing name> edit
     * <Function> Load the nurse's professional profile and display the edit
     *            form along with the list of available units.
     *
     * @param  \App\Models\User  $nurse
     * @return \Inertia\Response
     */
    public function edit(User $nurse): Response
    {
        $nurse->load('nurseProfile');

        return Inertia::render('Admin/Nurses/Edit', [
            'nurse' => $nurse,
            'units' => Unit::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * <Layer number> (5.0)
     *
     * <Processing name> update
     * <Function> Validate input, update the user account (conditionally
     *            updating the password only if a new one is provided), and
     *            update or create the associated nurse profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $nurse
     * @return \Illuminate\Http\RedirectResponse
     */
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
            'avatar' => ['nullable', 'string', 'max:16'],
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
            'avatar' => $data['avatar'] ?? '🧑‍⚕️',
        ]);

        return redirect()->route('admin.nurses.index')->with('success', 'Nurse staff updated.');
    }

    /**
     * <Layer number> (6.0)
     *
     * <Processing name> toggle
     * <Function> Toggle the `is_active` boolean on the nurse's professional
     *            profile to activate or deactivate the staff member.
     *
     * @param  \App\Models\User  $nurse
     * @return \Illuminate\Http\RedirectResponse
     */
    public function toggle(User $nurse): RedirectResponse
    {
        $nurse->nurseProfile()->update(['is_active' => ! $nurse->nurseProfile->is_active]);

        return back()->with('success', 'Nurse status updated.');
    }

    /**
     * <Layer number> (7.0)
     *
     * <Processing name> destroy
     * <Function> Delete the nurse's professional profile and then delete the
     *            user account itself.
     *
     * @param  \App\Models\User  $nurse
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(User $nurse): RedirectResponse
    {
        $nurse->nurseProfile()?->delete();
        $nurse->delete();

        return back()->with('success', 'Nurse staff deleted.');
    }
}