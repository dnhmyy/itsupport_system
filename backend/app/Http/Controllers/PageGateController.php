<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PageGateController extends Controller
{
    public function verify(Request $request, string $page)
    {
        $allowedRoles = [
            'monitoring' => ['admin', 'technician'],
            'credentials' => ['admin', 'technician'],
            'analytics' => ['admin'],
            'logs' => ['admin'],
        ];

        if (! array_key_exists($page, $allowedRoles)) {
            return response()->json([
                'message' => 'Page gate not found.',
            ], 404);
        }

        $validated = $request->validate([
            'pin' => 'required|string|min:4|max:64',
        ]);

        if (! in_array($request->user()->role, $allowedRoles[$page], true)) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $hash = config('security.page_gate_hashes.'.$page) ?: config('security.page_gate_hash');

        if (! is_string($hash) || $hash === '') {
            return response()->json([
                'message' => 'Access verification is unavailable.',
            ], 503);
        }

        if (! hash_equals($hash, hash('sha256', $validated['pin']))) {
            return response()->json([
                'message' => 'Access denied.',
            ], 422);
        }

        return response()->json([
            'message' => 'Access granted.',
        ]);
    }
}
