<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $permission  The permission name to check
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        // If user is not authenticated, deny access
        if (!$user) {
            abort(403, 'Unauthorized action.');
        }

        // If user is super admin (is_admin = true), allow all permissions
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        // Check if user has the required permission
        if (!$user->hasPermission($permission)) {
            abort(403, 'Unauthorized action. You do not have the required permission.');
        }

        return $next($request);
    }
}
