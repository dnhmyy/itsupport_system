<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use Illuminate\Http\Request;

class AssetController extends Controller
{
    public function index()
    {
        return response()->json(Asset::with(['units' => function($q) {
            $q->select('id', 'asset_id', 'branch');
        }])->withCount('units')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string',
            'brand' => 'required|string',
            'model' => 'required|string',
            'specification' => 'nullable|string',
        ]);

        $asset = Asset::create($validated);

        return response()->json($asset, 201);
    }

    public function show(Asset $asset)
    {
        return response()->json($asset->load('units'));
    }

    public function update(Request $request, Asset $asset)
    {
        $validated = $request->validate([
            'type' => 'string',
            'brand' => 'string',
            'model' => 'string',
            'specification' => 'nullable|string',
        ]);

        $asset->update($validated);

        return response()->json($asset);
    }

    public function destroy(Asset $asset)
    {
        $asset->delete();

        return response()->json(null, 204);
    }
}
