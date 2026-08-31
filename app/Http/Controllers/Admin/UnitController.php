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

    public function store(Request $request): RedirectResponse
    {
        Unit::create($request->validate($this->rules()));

        return back()->with('success', 'Unit created.');
    }

    public function update(Request $request, Unit $unit): RedirectResponse
    {
        $unit->update($request->validate($this->rules($unit)));

        return back()->with('success', 'Unit updated.');
    }

    public function destroy(Unit $unit): RedirectResponse
    {
        if ($unit->nurseProfiles()->count() > 0) {
            return back()->with('error', 'Cannot delete this unit because nurses are assigned to it.');
        }

        $unit->delete();

        return back()->with('success', 'Unit deleted.');
    }

    private function rules(?Unit $unit = null): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:units,name,' . ($unit?->id ?? 'NULL')],
            'code' => ['required', 'string', 'max:20', 'unique:units,code,' . ($unit?->id ?? 'NULL')],
        ];
    }
}