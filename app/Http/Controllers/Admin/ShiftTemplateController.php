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
    public function index(): Response
    {
        return Inertia::render('Admin/ShiftTemplates/Index', [
            'templates' => ShiftTemplate::with('unit')->orderBy('start_time')->get(),
            'units' => Unit::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        ShiftTemplate::create($request->validate($this->rules()));

        return back()->with('success', 'Shift template created.');
    }

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

    public function destroy(ShiftTemplate $shiftTemplate): RedirectResponse
    {
        $shiftTemplate->delete();

        return back()->with('success', 'Shift template deleted.');
    }

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