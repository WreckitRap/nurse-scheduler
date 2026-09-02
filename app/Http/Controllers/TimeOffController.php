<?php

namespace App\Http\Controllers;

use App\Models\TimeOffRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TimeOffController extends Controller
{
    /**************************************************************************/
    /* Processing Hierarchy                                                   */
    /**************************************************************************/
    // index                         (1.0)  Display the authenticated nurse's
    //                                      own time-off requests.
    // store                         (2.0)  Submit a new time-off request with
    //                                      validation, overlap check, and
    //                                      admin notification.

    /**
     * <Layer number> (1.0)
     *
     * <Processing name> index
     * <Function> Display the authenticated nurse staff's own time-off requests,
     *            ordered by start date (newest first).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request): Response
    {
        return Inertia::render('TimeOff/Index', [
            'requests' => $request->user()->timeOffRequests()->orderByDesc('start_date')->get(),
        ]);
    }

    /**
     * <Layer number> (2.0)
     *
     * <Processing name> store
     * <Function> Submit a new time-off request. Validates that the request is
     *            submitted at least 30 days in advance, checks for overlapping
     *            pending/approved requests, creates the request with 'pending'
     *            status, and notifies all nurse admins about the new request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request): RedirectResponse
    {
        // Validate input: start must be 30+ days ahead, end must be after start
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

        // Check for overlapping pending or approved requests
        $overlap = $request->user()->timeOffRequests()
            ->where('status', '!=', 'rejected')
            ->where('start_date', '<=', $data['end_date'])
            ->where('end_date', '>=', $data['start_date'])
            ->exists();

        if ($overlap) {
            return back()->with('error', 'You already have a request that overlaps those dates.');
        }

        // Create the time-off request with pending status
        $request->user()->timeOffRequests()->create([
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'reason' => $data['reason'] ?? null,
            'status' => 'pending',
        ]);

        // Notify all nurse admins about the new request
        User::where('role', 'nurse_admin')->each(
            fn ($admin) => $admin->notifications()->create([
                'message' => $request->user()->name.' requested time off ('
                    .Carbon::parse($data['start_date'])->format('M d').' → '
                    .Carbon::parse($data['end_date'])->format('M d').').',
                'link' => route('admin.time-off.index'),
            ])
        );

        return back()->with('success', 'Time-off request submitted for approval.');
    }
}