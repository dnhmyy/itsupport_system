<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::with('user');

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('action')) {
            $query->where('action', 'like', '%' . $request->action . '%');
        }

        return response()->json($query->latest()->paginate(50));
    }

    public function show(AuditLog $auditLog)
    {
        return response()->json($auditLog->load('user'));
    }
}
