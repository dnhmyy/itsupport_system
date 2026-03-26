<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PageGateController extends Controller
{
    public function verify(Request $request, string $page)
    {
        $validated = $request->validate([
            'pin' => 'required|string|min:4|max:64',
        ]);

        $allowedRoles = [
            'monitoring' => ['admin'],
            'credentials' => ['admin', 'technician'],
            'analytics' => ['admin'],
        ];

        if (isset($allowedRoles[$page]) && ! in_array($request->user()->role, $allowedRoles[$page], true)) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $hash = config('security.page_gate_hashes.'.$page) ?: config('security.page_gate_hash');

        if (! is_string($hash) || $hash === '') {
            return response()->json([
                'message' => 'Page gate is not configured.',
            ], 503);
        }

        if (! hash_equals($hash, hash('sha256', $validated['pin']))) {
            return response()->json([
                'message' => 'Incorrect PIN. Access denied.',
            ], 422);
        }

        return response()->json([
            'message' => 'Access granted.',
        ]);
    }
}
