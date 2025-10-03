<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PterodactylService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class RegisteredUserController extends Controller
{
    public function __construct(private PterodactylService $ptero)
    {
    }

    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        try {
            $user = DB::transaction(function () use ($request) {
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                ]);

                // Create remote user on Pterodactyl via service
                $payload = $this->ptero->buildUserPayload(
                    $request->name,
                    $request->email,
                    $request->password
                );

                $pteroUser = $this->ptero->createUser($payload);

                // Save linkage to local user
                $user->update([
                    'pterodactyl_id' => $pteroUser['id'] ?? null,
                    'pterodactyl_uuid' => $pteroUser['uuid'] ?? null,
                ]);

                return $user;
            });
        } catch (Throwable $e) {
            report($e);

            return back()
                ->withInput($request->except('password', 'password_confirmation'))
                ->withErrors([
                    'email' =>
                        'Registration failed due to an external service error. Please try again.',
                ]);
        }

        event(new Registered($user));
        Auth::login($user);

        return redirect()->intended('/dashboard');
    }

    // If you want a controller-accessible “find by email”, delegate to the service:
    public function findPterodactylUserByEmail(string $email): ?array
    {
        return $this->ptero->findUserByEmail($email);
    }
}
