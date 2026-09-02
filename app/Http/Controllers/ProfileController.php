<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**************************************************************************/
    /* Processing Hierarchy                                                   */
    /**************************************************************************/
    // edit                          (1.0)  Display the user's profile form.
    // update                        (2.0)  Update the user's profile
    //                                      information and reset email
    //                                      verification if changed.
    // destroy                       (3.0)  Delete the user's account after
    //                                      password confirmation.

    /**
     * <Layer number> (1.0)
     *
     * <Processing name> edit
     * <Function> Display the user's profile form. Passes the mustVerifyEmail
     *            flag (based on the user model's implementation) and the
     *            verification status from the session.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * <Layer number> (2.0)
     *
     * <Processing name> update
     * <Function> Update the user's profile information using validated data
     *            from the ProfileUpdateRequest. If the email address was
     *            changed, the email_verified_at timestamp is cleared to
     *            require re-verification.
     *
     * @param  \App\Http\Requests\ProfileUpdateRequest  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        // Fill user with validated data from the request
        $request->user()->fill($request->validated());

        // If email was changed, clear verification timestamp
        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        // Save the updated user profile
        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * <Layer number> (3.0)
     *
     * <Processing name> destroy
     * <Function> Delete the user's account after validating the password
     *            confirmation. Logs the user out, deletes the account,
     *            invalidates the session, regenerates the CSRF token, and
     *            redirects to the home page.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Validate password confirmation
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        // Log the user out before deletion
        Auth::logout();

        // Delete the user account
        $user->delete();

        // Invalidate session and regenerate CSRF token for security
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}