<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShiftTemplate;
use App\Models\Unit;
use App\Models\Shift;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShiftTemplateController extends Controller
{
    /**************************************************************************/
    /* Processing Hierarchy                                                   */
    /**************************************************************************/
    // index                         (1.0)  Display all shift templates with
    //                                      their associated units.
    // store                         (2.0)  Create a new shift template.
    // update                        (3.0)  Update a shift template and
    //                                      propagate changes to shifts in
    //                                      draft schedules only.
    // destroy                       (4.0)  Delete a shift template.
    // rules                         (5.0)  Validation rules for shift
    //                                      template fields.

    /**
     * <Layer number> (1.0)
     *
     * <Processing name> index
     * <Function> Display all shift templates ordered by start time, with
     *            eager-loaded unit data to avoid N+1 queries.
     *
     * @return \Inertia\Response
     */
    public function index(): Response
    {
        return Inertia::render('Admin/ShiftTemplates/Index', [
            'templates' => ShiftTemplate::with('unit')->orderBy('start_time')->get(),
            'units' => Unit::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * <Layer number> (2.0)
     *
     * <Processing name> store
     * <Function> Create a new shift template using validated data including
     *            name, unit, times, required nurses, and color.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request): RedirectResponse
    {
        ShiftTemplate::create($request->validate($this->rules()));

        return back()->with('success', 'Shift template created.');
    }

    /**
     * <Layer number> (3.0)
     *
     * <Processing name> update
     * <Function> Update a shift template using validated data. After updating,
     *            propagates the changes (times, required nurses, color, unit)
     *            to all shifts in draft schedules only. Published schedules
     *            are protected from automatic changes to preserve historical
     *            accuracy.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\ShiftTemplate  $shiftTemplate
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, ShiftTemplate $shiftTemplate): RedirectResponse
    {
        $shiftTemplate->update($request->validate($this->rules()));

        // Propagate changes to shifts in DRAFT schedules only
        Shift::where('shift_template_id', $shiftTemplate->id)
            ->whereHas('schedule', fn ($q) => $q->where('status', 'draft'))
            ->update(array_merge(
                [
                    'start_time' => $shiftTemplate->start_time,
                    'end_time' => $shiftTemplate->end_time,
                    'required_nurses' => $shiftTemplate->required_nurses,
                    'color' => $shiftTemplate->color,
                ],
                $shiftTemplate->unit_id ? ['unit_id' => $shiftTemplate->unit_id] : [],
            ));

        return back()->with('success', 'Shift template updated.');
    }

    /**
     * <Layer number> (4.0)
     *
     * <Processing name> destroy
     * <Function> Delete a shift template.
     *
     * @param  \App\Models\ShiftTemplate  $shiftTemplate
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(ShiftTemplate $shiftTemplate): RedirectResponse
    {
        $shiftTemplate->delete();

        return back()->with('success', 'Shift template deleted.');
    }

    /**
     * <Layer number> (5.0)
     *
     * <Processing name> rules
     * <Function> Validation rules for shift template fields: name, unit_id,
     *            start_time, end_time, required_nurses, and color.
     *
     * @return array<string, array<int, string>>
     */
    private function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'unit_id' => ['nullable', 'exists:units,id'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'required_nurses' => ['required', 'integer', 'min:1', 'max:20'],
            'color' => ['required', 'in:indigo,green,amber,rose,sky,violet'],
        ];
    }
}