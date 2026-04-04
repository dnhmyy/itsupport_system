<?php

namespace App\Http\Controllers;

use App\Models\AssetUnit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AssetUnitController extends Controller
{
    public function index(Request $request)
    {
        $validated = Validator::make($request->query(), [
            'asset_id' => 'sometimes|integer|exists:assets,id',
            'status' => 'sometimes|in:available,used,broken,repair',
        ])->validate();

        $query = AssetUnit::with('asset', 'assignedTo');

        if (array_key_exists('asset_id', $validated)) {
            $query->where('asset_id', $validated['asset_id']);
        }

        if (array_key_exists('status', $validated)) {
            $query->where('status', $validated['status']);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'asset_id' => 'required|exists:assets,id',
            'name' => 'nullable|string',
            'serial_number' => 'nullable|string|unique:asset_units,serial_number',
            'specification' => 'nullable|string',
            'status' => 'string|in:available,used,broken,repair',
            'branch' => 'nullable|string',
            'assigned_to_user_id' => 'nullable|exists:users,id',
            'received_at' => 'nullable|date',
            'warranty_expiry' => 'nullable|date',
            'quantity' => 'nullable|integer|min:1|max:50',
        ]);

        $quantity = $request->get('quantity', 1) ?: 1;
        $units = [];

        for ($i = 0; $i < $quantity; $i++) {
            $units[] = AssetUnit::create($validated);
        }

        return response()->json($units, 201);
    }

    public function show(AssetUnit $assetUnit)
    {
        return response()->json($assetUnit->load('asset', 'assignedTo', 'tickets'));
    }

    public function update(Request $request, AssetUnit $assetUnit)
    {
        $validated = $request->validate([
            'asset_id' => 'exists:assets,id',
            'name' => 'nullable|string',
            'serial_number' => 'nullable|string|unique:asset_units,serial_number,' . $assetUnit->id,
            'specification' => 'nullable|string',
            'status' => 'string|in:available,used,broken,repair',
            'branch' => 'nullable|string',
            'assigned_to_user_id' => 'nullable|exists:users,id',
            'received_at' => 'nullable|date',
            'warranty_expiry' => 'nullable|date',
        ]);

        $assetUnit->update($validated);

        return response()->json($assetUnit);
    }

    public function destroy(AssetUnit $assetUnit)
    {
        $assetUnit->delete();

        return response()->json(null, 204);
    }
}
