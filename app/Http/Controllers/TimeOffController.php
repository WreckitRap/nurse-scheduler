<?php

namespace App\Http\Controllers;

use App\Models\TimeOffRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TimeOffController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('TimeOff/Index', [
            'requests' => $request->user()->timeOffRequests()->orderByDesc('start_date')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate(
            [
                'start_date' => ['required', 'date', 'after_or_equal:'.now()->addDays(30)->toDateString()],
                'end_date' => ['required', 'date', 'after_or_equal:start_date'],
                'reason' => ['nullable', 'string', 'max:500'],
            ],
            [
                'start_date.after_or_equal' => 'Time off must be requested at least 30 days in advance.',
            ]
        );

        $overlap = $request->user()->timeOffRequests()
            ->where('status', '!=', 'rejected')
            ->where('start_date', '<=', $data['end_date'])
            ->where('end_date', '>=', $data['start_date'])
            ->exists();

        if ($overlap) {
            return back()->with('error', 'You already have a request that overlaps those dates.');
        }

        $request->user()->timeOffRequests()->create([
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'reason' => $data['reason'] ?? null,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Time-off request submitted for approval.');
    }
}