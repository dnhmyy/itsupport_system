<?php

namespace App\Http\Controllers;

use App\Models\Credential;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class CredentialController extends Controller
{
    public function index()
    {
        // Don't return the password in the list
        return response()->json(Credential::select(['id', 'title', 'category', 'username', 'url', 'created_at'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string',
            'username' => 'required|string',
            'password' => 'required|string',
            'url' => 'nullable|url',
            'notes' => 'nullable|string',
        ]);

        $credential = Credential::create($validated);

        AuditLog::create([
            'user_id'     => Auth::id(),
            'action'      => 'CREATE_CREDENTIAL',
            'module'      => 'credentials',
            'description' => "Created credential: {$credential->title}",
            'ip_address'  => $request->ip(),
        ]);

        // Never return the password in a create response
        return response()->json($credential->only(['id', 'title', 'category', 'username', 'url', 'notes', 'created_at']), 201);
    }

    public function show(Request $request, Credential $credential)
    {
        AuditLog::create([
            'user_id'     => Auth::id(),
            'action'      => 'VIEW_CREDENTIAL_METADATA',
            'module'      => 'credentials',
            'description' => "Viewed credential metadata: {$credential->title}",
            'ip_address'  => $request->ip(),
        ]);

        return response()->json([
            'id' => $credential->id,
            'title' => $credential->title,
            'category' => $credential->category,
            'username' => $credential->username,
            'url' => $credential->url,
            'notes' => $credential->notes,
            'created_at' => $credential->created_at,
        ]);
    }

    public function reveal(Request $request, Credential $credential)
    {
        $validated = $request->validate([
            'password' => 'required|string',
        ]);

        $user = $request->user();

        if (! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Password confirmation failed.',
            ], 422);
        }

        AuditLog::create([
            'user_id'     => Auth::id(),
            'action'      => 'REVEAL_CREDENTIAL',
            'module'      => 'credentials',
            'description' => "Revealed credential after password reconfirmation: {$credential->title}",
            'ip_address'  => $request->ip(),
        ]);

        // Return ONLY the sensitive fields, not the full record
        return response()->json([
            'username' => $credential->username,
            'password' => $credential->password,
            'notes'    => $credential->notes,
            'url'      => $credential->url,
        ]);
    }

    public function update(Request $request, Credential $credential)
    {
        $validated = $request->validate([
            'title'            => 'sometimes|string|max:255',
            'category'         => 'sometimes|string',
            'username'         => 'sometimes|string',
            'password'         => 'sometimes|string',
            'url'              => 'nullable|url',
            'notes'            => 'nullable|string',
            'confirm_password' => 'required|string',
        ]);

        // Require the user to re-confirm their own login password before updating
        if (!Hash::check($validated['confirm_password'], $request->user()->password)) {
            return response()->json(['message' => 'Password confirmation failed. Cannot update credential.'], 422);
        }

        unset($validated['confirm_password']);
        $credential->update($validated);

        AuditLog::create([
            'user_id'     => Auth::id(),
            'action'      => 'UPDATE_CREDENTIAL',
            'module'      => 'credentials',
            'description' => "Updated credential: {$credential->title}",
            'ip_address'  => $request->ip(),
        ]);

        return response()->json($credential->only(['id', 'title', 'category', 'username', 'url', 'notes', 'created_at']));
    }

    public function destroy(Request $request, Credential $credential)
    {
        $title = $credential->title;
        $credential->delete();

        AuditLog::create([
            'user_id'     => Auth::id(),
            'action'      => 'DELETE_CREDENTIAL',
            'module'      => 'credentials',
            'description' => "Deleted credential: {$title}",
            'ip_address'  => $request->ip(),
        ]);

        return response()->json(null, 204);
    }
}
