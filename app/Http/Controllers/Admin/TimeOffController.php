<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TimeOffRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TimeOffController extends Controller
{
    /**************************************************************************/
    /* Processing Hierarchy                                                   */
    /**************************************************************************/
    // index                         (1.0)  Display all time-off requests
    //                                      with eager-loaded user data.
    // approve                       (2.0)  Approve a time-off request and
    //                                      notify the requesting nurse.
    // reject                        (3.0)  Reject a time-off request and
    //                                      notify the requesting nurse.

    /**
     * <Layer number> (1.0)
     *
     * <Processing name> index
     * <Function> Display all time-off requests ordered by start date, with
     *            eager-loaded user, nurse profile, and unit data to avoid
     *            N+1 query problems.
     *
     * @return \Inertia\Response
     */
    public function index(): Response
    {
        return Inertia::render('Admin/TimeOff/Index', [
            'requests' => TimeOffRequest::with('user.nurseProfile.unit')
                ->orderBy('start_date')
                ->get(),
        ]);
    }

    /**
     * <Layer number> (2.0)
     *
     * <Processing name> approve
     * <Function> Approve a time-off request by updating its status to
     *            'approved', recording the admin who made the decision and
     *            the decision timestamp. Creates a notification for the
     *            requesting nurse with the approval confirmation.
     *
     * @param  \App\Models\TimeOffRequest  $timeOffRequest
     * @return \Illuminate\Http\RedirectResponse
     */
    public function approve(TimeOffRequest $timeOffRequest): RedirectResponse
    {
        $timeOffRequest->update([
            'status' => 'approved',
            'decided_by' => auth()->id(),
            'decided_at' => now(),
        ]);

        $timeOffRequest->user->notifications()->create([
            'message' => 'Your time-off request ('.$timeOffRequest->start_date->format('M d').' → '.$timeOffRequest->end_date->format('M d').') was approved. ✅',
            'link' => route('time-off.index'),
        ]);

        return back()->with('success', 'Request approved.');
    }

    /**
     * <Layer number> (3.0)
     *
     * <Processing name> reject
     * <Function> Reject a time-off request by updating its status to
     *            'rejected', recording the admin who made the decision and
     *            the decision timestamp. Creates a notification for the
     *            requesting nurse with the rejection confirmation.
     *
     * @param  \App\Models\TimeOffRequest  $timeOffRequest
     * @return \Illuminate\Http\RedirectResponse
     */
    public function reject(TimeOffRequest $timeOffRequest): RedirectResponse
    {
        $timeOffRequest->update([
            'status' => 'rejected',
            'decided_by' => auth()->id(),
            'decided_at' => now(),
        ]);

        $timeOffRequest->user->notifications()->create([
            'message' => 'Your time-off request ('.$timeOffRequest->start_date->format('M d').' → '.$timeOffRequest->end_date->format('M d').') was rejected. ❌',
            'link' => route('time-off.index'),
        ]);

        return back()->with('success', 'Request rejected.');
    }
}