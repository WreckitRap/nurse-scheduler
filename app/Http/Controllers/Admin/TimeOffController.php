<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TimeOffRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TimeOffController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/TimeOff/Index', [
            'requests' => TimeOffRequest::with('user.nurseProfile.unit')
                ->orderBy('start_date')
                ->get(),
        ]);
    }

    public function approve(TimeOffRequest $timeOffRequest): RedirectResponse
    {
        $timeOffRequest->update([
            'status' => 'approved',
            'decided_by' => auth()->id(),
            'decided_at' => now(),
        ]);

        return back()->with('success', 'Request approved.');
    }

    public function reject(TimeOffRequest $timeOffRequest): RedirectResponse
    {
        $timeOffRequest->update([
            'status' => 'rejected',
            'decided_by' => auth()->id(),
            'decided_at' => now(),
        ]);

        return back()->with('success', 'Request rejected.');
    }
}