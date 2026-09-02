<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**************************************************************************/
    /* Processing Hierarchy                                                   */
    /**************************************************************************/
    // $rootView                     (1.0)  The root template loaded on the
    //                                      first page visit.
    // version                       (2.0)  Determine the current asset version.
    // share                         (3.0)  The props shared by default with
    //                                      every Inertia response.

    /**
     * <Layer number> (1.0)
     *
     * <Processing name> $rootView
     * <Function> The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * <Layer number> (2.0)
     *
     * <Processing name> version
     * <Function> Determine the current asset version.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * <Layer number> (3.0)
     *
     * <Processing name> share
     * <Function> Define the props that are shared by default with every
     *            Inertia response (auth user, flash messages, notifications).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user()?->load('nurseProfile'),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'notifications' => fn () => $request->user()
                ? $request->user()->notifications()->latest()->take(10)->get()
                : null,
        ];
    }
}