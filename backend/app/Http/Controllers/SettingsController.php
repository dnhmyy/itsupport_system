<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class SettingsController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'profile' => [
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'role' => $request->user()->role,
                'team' => 'IT Support',
                'profile_icon' => $request->user()->profile_icon,
                'requester_icon' => $request->user()->requester_icon,
            ],
        ]);
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'profile_icon' => ['nullable', 'string', 'max:100', 'regex:/^[A-Za-z0-9_-]+$/'],
        ]);

        $request->user()->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'profile' => [
                'name' => $request->user()->name,
                'profile_icon' => $request->user()->profile_icon,
            ],
        ]);
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:12', 'max:255', 'confirmed'],
        ]);

        if (! Hash::check($validated['current_password'], $request->user()->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect.'],
            ]);
        }

        $request->user()->update([
            'password' => $validated['new_password'],
        ]);

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }
}
