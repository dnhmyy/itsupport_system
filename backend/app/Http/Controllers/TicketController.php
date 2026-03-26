<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\TicketActivity;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Ticket::with(['creator', 'assignee', 'assetUnit', 'monitoringHost']);

        if (! in_array($user->role, ['admin', 'technician'], true)) {
            $query->where(function ($builder) use ($user) {
                $builder
                    ->where('created_by_user_id', $user->id)
                    ->orWhere('assigned_to_user_id', $user->id);
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('asset_unit_id')) {
            $query->where('asset_unit_id', $request->asset_unit_id);
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'required|in:low,medium,high,critical',
            'asset_unit_id' => 'nullable|exists:asset_units,id',
            'monitoring_host_id' => 'nullable|exists:monitoring_hosts,id',
            'attachment' => 'nullable|image|max:5120',
        ]);
        unset($validated['attachment']);

        $ticket = Ticket::create($validated + [
            'status' => 'open',
            'progress_percentage' => 0,
            'created_by_user_id' => Auth::id(),
        ] + $this->storeAttachment($request));

        TicketActivity::create([
            'ticket_id' => $ticket->id,
            'user_id' => Auth::id(),
            'type' => 'status_change',
            'activity' => 'Ticket created.',
            'status_to' => 'open',
            'progress_to' => 0,
        ]);

        if ($ticket->attachment_path) {
            TicketActivity::create([
                'ticket_id' => $ticket->id,
                'user_id' => Auth::id(),
                'type' => 'attachment',
                'activity' => 'Attachment uploaded.',
                'status_to' => 'open',
                'progress_to' => 0,
            ]);
        }

        $ticket->load(['creator', 'assignee', 'assetUnit', 'monitoringHost']);
        NotificationService::notifyTicketCreated($ticket);

        return response()->json($ticket, 201);
    }

    public function show(Request $request, Ticket $ticket)
    {
        $this->authorizeTicketAccess($request, $ticket);

        return response()->json(
            $ticket->load(['creator', 'assignee', 'assetUnit', 'monitoringHost', 'activities.user'])
        );
    }

    public function update(Request $request, Ticket $ticket)
    {
        $this->authorizeTicketAccess($request, $ticket);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'priority' => 'sometimes|in:low,medium,high,critical',
            'status' => 'sometimes|in:open,in_progress,done',
            'assigned_to_user_id' => 'nullable|exists:users,id',
            'progress_percentage' => 'sometimes|integer|min:0|max:100',
            'attachment' => 'nullable|image|max:5120',
            'progress_note' => 'nullable|string',
        ]);
        unset($validated['attachment']);

        $oldStatus = $ticket->status;
        $oldProgress = $ticket->progress_percentage ?? 0;
        $oldAssignee = $ticket->assigned_to_user_id;
        $progressNote = $request->input('progress_note');

        if (isset($validated['status']) && $validated['status'] === 'done' && ! isset($validated['progress_percentage'])) {
            $validated['progress_percentage'] = 100;
        }

        $ticket->update($validated + $this->storeAttachment($request, $ticket));
        $ticket->refresh()->load(['creator', 'assignee', 'assetUnit', 'monitoringHost', 'activities.user']);

        $changes = [];
        $statusChanged = array_key_exists('status', $validated) && $validated['status'] !== $oldStatus;
        $progressChanged = array_key_exists('progress_percentage', $validated) && (int) $validated['progress_percentage'] !== $oldProgress;
        $assignmentChanged = array_key_exists('assigned_to_user_id', $validated) && $validated['assigned_to_user_id'] != $oldAssignee;

        if ($statusChanged) $changes[] = "status to {$ticket->status}";
        if ($progressChanged) $changes[] = "progress to {$ticket->progress_percentage}%";

        // Create a consolidated activity log if any significant change or note was provided
        if ($statusChanged || $progressChanged || $progressNote) {
            $changeText = count($changes) > 0 ? "Updated " . implode(', ', $changes) . "." : "";
            $activityText = $progressNote ? ($changeText ? $changeText . " Note: " . $progressNote : $progressNote) : $changeText;

            TicketActivity::create([
                'ticket_id' => $ticket->id,
                'user_id' => Auth::id(),
                'type' => 'progress_change',
                'activity' => $activityText,
                'status_to' => $ticket->status,
                'progress_to' => $ticket->progress_percentage,
            ]);

            if ($progressNote) {
                NotificationService::notifyTicketCommentAdded($ticket, Auth::user()->name, $progressNote);
            }

            // Single notification for progress/status if no note is provided
            // If note is provided, we prefer the comment notification
            if (!$progressNote) {
                if ($statusChanged) {
                    NotificationService::notifyTicketStatusChanged($ticket, $oldStatus, $ticket->status);
                } else {
                    NotificationService::notifyTicketProgressChanged($ticket, $oldProgress, (int)$ticket->progress_percentage);
                }
            }
        }

        if ($assignmentChanged) {
            TicketActivity::create([
                'ticket_id' => $ticket->id,
                'user_id' => Auth::id(),
                'type' => 'assignment',
                'activity' => 'Ticket assigned to ' . ($ticket->assignee->name ?? 'Unassigned'),
                'status_to' => $ticket->status,
                'progress_to' => $ticket->progress_percentage,
            ]);
            NotificationService::notifyTicketAssigned($ticket);
        }

        if ($ticket->wasChanged('attachment_path')) {
            TicketActivity::create([
                'ticket_id' => $ticket->id,
                'user_id' => Auth::id(),
                'type' => 'attachment',
                'activity' => 'Attachment updated.',
                'status_to' => $ticket->status,
                'progress_to' => $ticket->progress_percentage,
            ]);
        }

        return response()->json($ticket);
    }

    public function destroy(Request $request, Ticket $ticket)
    {
        $this->authorizeTicketAccess($request, $ticket);

        if ($ticket->attachment_path) {
            Storage::disk('public')->delete($ticket->attachment_path);
        }

        $ticket->delete();

        return response()->json(null, 204);
    }

    public function addActivity(Request $request, Ticket $ticket)
    {
        $this->authorizeTicketAccess($request, $ticket);

        $validated = $request->validate([
            'activity' => 'required|string',
        ]);

        $activity = TicketActivity::create([
            'ticket_id' => $ticket->id,
            'user_id' => Auth::id(),
            'type' => 'comment',
            'activity' => $validated['activity'],
            'status_to' => $ticket->status,
            'progress_to' => $ticket->progress_percentage,
        ]);

        NotificationService::notifyTicketCommentAdded($ticket, Auth::user()->name, $validated['activity']);

        return response()->json($activity, 201);
    }

    private function storeAttachment(Request $request, ?Ticket $ticket = null): array
    {
        if (! $request->hasFile('attachment')) {
            return [];
        }

        if ($ticket?->attachment_path) {
            Storage::disk('public')->delete($ticket->attachment_path);
        }

        $file = $request->file('attachment');
        $path = $file->store('ticket-attachments', 'public');

        return [
            'attachment_path' => $path,
            'attachment_original_name' => $file->getClientOriginalName(),
            'attachment_mime_type' => $file->getMimeType(),
        ];
    }

    private function authorizeTicketAccess(Request $request, Ticket $ticket): void
    {
        $user = $request->user();

        if (in_array($user->role, ['admin', 'technician'], true)) {
            return;
        }

        abort_unless(
            $ticket->created_by_user_id === $user->id || $ticket->assigned_to_user_id === $user->id,
            403,
            'Unauthorized.'
        );
    }

}
