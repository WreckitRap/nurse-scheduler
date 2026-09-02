<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**************************************************************************/
    /* Processing Hierarchy                                                   */
    /**************************************************************************/
    // readAll                       (1.0)  Mark all unread notifications as
    //                                      read for the authenticated user.

    /**
     * <Layer number> (1.0)
     *
     * <Processing name> readAll
     * <Function> Mark all unread notifications as read for the authenticated
     *            user. Updates all notifications where read_at is null with
     *            the current timestamp, then redirects back to the previous
     *            page.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function readAll(Request $request): RedirectResponse
    {
        $request->user()->notifications()->whereNull('read_at')->update(['read_at' => now()]);

        return back();
    }
}