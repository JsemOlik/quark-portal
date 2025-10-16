<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        // Allow super admins (is_admin=true) OR users with a staff role
        if (!$user || (!$user->is_admin && !$user->role_id)) {
            abort(403, 'Access denied. Admin or staff role required.');
        }

        return $next($request);
    }
}
