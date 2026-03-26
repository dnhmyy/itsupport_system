<?php

namespace App\Http\Controllers;

use App\Models\UserNotification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->take(10)
            ->get();

        return response()->json([
            'unread_count' => $request->user()->notifications()->whereNull('read_at')->count(),
            'items' => $notifications,
        ]);
    }

    public function markRead(Request $request, UserNotification $notification)
    {
        abort_unless($notification->user_id === $request->user()->id, 403);

        $notification->update([
            'read_at' => now(),
        ]);

        return response()->json($notification);
    }

    public function markAllRead(Request $request)
    {
        $request->user()->notifications()
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'All marked as read']);
    }
}
