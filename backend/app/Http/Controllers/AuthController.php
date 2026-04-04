<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'device_name' => 'nullable|string|max:100',
            'use_token' => 'nullable|boolean',
        ]);

        $throttleKey = Str::lower($request->input('email')).'|'.$request->ip();

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            RateLimiter::hit($throttleKey, 300);

            AuditLog::create([
                'action' => 'LOGIN_FAILED',
                'module' => 'auth',
                'description' => 'Failed login attempt.',
                'ip_address' => $request->ip(),
                'user_agent' => substr((string) $request->userAgent(), 0, 255),
            ]);

            return response()->json([
                'message' => 'Invalid credentials.',
            ], 422);
        }

        RateLimiter::clear($throttleKey);

        $deviceName = $request->device_name ?? 'web-app';
        $user->tokens()->where('name', $deviceName)->delete();

        $token = $user->createToken(
            $deviceName,
            ['*'],
            now()->addMinutes((int) config('sanctum.expiration', 480))
        )->plainTextToken;

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'LOGIN_SUCCESS',
            'module' => 'auth',
            'description' => 'User logged in successfully.',
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        $responsePayload = [
            'user' => $user,
            'expires_in_minutes' => (int) config('sanctum.expiration', 480),
        ];

        if ($request->boolean('use_token')) {
            $responsePayload['token'] = $token;
            $responsePayload['token_type'] = 'Bearer';
        }

        $response = response()->json($responsePayload, $request->boolean('use_token') ? 200 : 201);

        if ($request->boolean('use_token')) {
            return $response;
        }

        return $response->cookie(
            cookie(
                config('session.auth_cookie', 'itsupport_access_token'),
                $token,
                (int) config('sanctum.expiration', 480),
                '/',
                config('session.domain'),
                (bool) config('session.secure'),
                true,
                false,
                config('session.same_site', 'strict')
            )
        );
    }

    public function logout(Request $request)
    {
        AuditLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'LOGOUT',
            'module' => 'auth',
            'description' => 'User logged out.',
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out successfully'])
            ->withoutCookie(
                config('session.auth_cookie', 'itsupport_access_token'),
                '/',
                config('session.domain')
            );
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
