<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UnitController extends Controller
{
    /**************************************************************************/
    /* Processing Hierarchy                                                   */
    /**************************************************************************/
    // index                         (1.0)  Display all units with nurse
    //                                      counts (total and active).
    // store                         (2.0)  Create a new unit.
    // update                        (3.0)  Update an existing unit.
    // destroy                       (4.0)  Delete a unit (blocked if nurses
    //                                      are assigned to it).
    // rules                         (5.0)  Validation rules for unit fields.

    /**
     * <Layer number> (1.0)
     *
     * <Processing name> index
     * <Function> Display all units ordered by name, with the total nurse
     *            profile count and the active nurse profile count attached
     *            to each unit.
     *
     * @return \Inertia\Response
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Units/Index', [
            'units' => Unit::orderBy('name')
                ->withCount([
                    'nurseProfiles as total_count',
                    'nurseProfiles as active_count' => fn ($q) => $q->where('is_active', true),
                ])
                ->get(),
        ]);
    }

    /**
     * <Layer number> (2.0)
     *
     * <Processing name> store
     * <Function> Create a new unit using validated name and code.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request): RedirectResponse
    {
        Unit::create($request->validate($this->rules()));

        return back()->with('success', 'Unit created.');
    }

    /**
     * <Layer number> (3.0)
     *
     * <Processing name> update
     * <Function> Update an existing unit's name and code using validated
     *            data (excluding itself from uniqueness checks).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Unit  $unit
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Unit $unit): RedirectResponse
    {
        $unit->update($request->validate($this->rules($unit)));

        return back()->with('success', 'Unit updated.');
    }

    /**
     * <Layer number> (4.0)
     *
     * <Processing name> destroy
     * <Function> Delete a unit. Blocked with an error if any nurse profiles
     *            are still assigned to it, protecting data integrity.
     *
     * @param  \App\Models\Unit  $unit
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Unit $unit): RedirectResponse
    {
        if ($unit->nurseProfiles()->count() > 0) {
            return back()->with('error', 'Cannot delete this unit because nurses are assigned to it.');
        }

        $unit->delete();

        return back()->with('success', 'Unit deleted.');
    }

    /**
     * <Layer number> (5.0)
     *
     * <Processing name> rules
     * <Function> Validation rules for unit name and code. Uniqueness checks
     *            ignore the given unit when updating.
     *
     * @param  \App\Models\Unit|null  $unit
     * @return array<string, array<int, string>>
     */
    private function rules(?Unit $unit = null): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:units,name,' . ($unit?->id ?? 'NULL')],
            'code' => ['required', 'string', 'max:20', 'unique:units,code,' . ($unit?->id ?? 'NULL')],
        ];
    }
}