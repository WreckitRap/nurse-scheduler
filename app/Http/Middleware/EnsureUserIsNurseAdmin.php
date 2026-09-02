<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsNurseAdmin
{
    /**************************************************************************/
    /* Processing Hierarchy                                                   */
    /**************************************************************************/
    // handle                        (1.0)  Handle an incoming request and
    //                                      restrict access to nurse admins.

    /**
     * <Layer number> (1.0)
     *
     * <Processing name> handle
     * <Function> Handle an incoming request. Aborts with a 403 error if the
     *            authenticated user is not a nurse admin.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->isAdmin()) {
            abort(403);
        }

        return $next($request);
    }
}