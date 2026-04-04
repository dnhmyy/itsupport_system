<?php

namespace App\Services;

use App\Models\Ticket;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    public static function send(string $message): void
    {
        self::sendToTelegram($message);
        self::sendToDiscord($message);
    }

    public static function sendToTelegram(string $message): void
    {
        $token = env('TELEGRAM_BOT_TOKEN');
        $chatId = env('TELEGRAM_CHAT_ID');

        if (! $token || ! $chatId) {
            return;
        }

        try {
            Http::post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => 'Markdown',
            ]);
        } catch (\Exception $e) {
            Log::error('Telegram notification failed.', [
                'exception' => $e::class,
            ]);
        }
    }

    public static function sendToDiscord(string $message): void
    {
        $webhookUrl = env('DISCORD_WEBHOOK_URL');

        if (! $webhookUrl) {
            return;
        }

        try {
            Http::post($webhookUrl, [
                'content' => $message,
            ]);
        } catch (\Exception $e) {
            Log::error('Discord notification failed.', [
                'exception' => $e::class,
            ]);
        }
    }

    public static function notifyTicketCreated(Ticket $ticket): void
    {
        $recipients = User::query()
            ->whereIn('role', ['admin', 'technician'])
            ->get();

        self::storeForUsers(
            $recipients,
            'ticket_created',
            'New ticket created',
            "Ticket {$ticket->title} created with {$ticket->priority} priority.",
            [
                'ticket_id' => $ticket->id,
                'status' => $ticket->status,
                'priority' => $ticket->priority,
            ]
        );

        self::send(
            "🎫 *New Ticket Created!*\n".
            "Title: {$ticket->title}\n".
            "Priority: {$ticket->priority}\n".
            "Reporter: {$ticket->creator?->name}\n".
            "Status: {$ticket->status}"
        );
    }

    public static function notifyTicketAssigned(Ticket $ticket): void
    {
        $recipients = self::uniqueUsers(collect([
            $ticket->creator,
            $ticket->assignee,
        ]));

        if ($recipients->isEmpty()) {
            return;
        }

        self::storeForUsers(
            $recipients,
            'ticket_assigned',
            'Ticket assignment updated',
            "Ticket {$ticket->title} is now assigned to ".($ticket->assignee?->name ?? 'Unassigned').'.',
            [
                'ticket_id' => $ticket->id,
                'assigned_to_user_id' => $ticket->assigned_to_user_id,
            ]
        );
    }

    public static function notifyTicketStatusChanged(Ticket $ticket, string $oldStatus, string $newStatus): void
    {
        $recipients = self::uniqueUsers(collect([
            $ticket->creator,
            $ticket->assignee,
        ]));

        if ($recipients->isEmpty()) {
            return;
        }

        self::storeForUsers(
            $recipients,
            'ticket_status_changed',
            'Ticket status updated',
            "Ticket {$ticket->title} changed from {$oldStatus} to {$newStatus}.",
            [
                'ticket_id' => $ticket->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'progress_percentage' => $ticket->progress_percentage,
            ]
        );

        self::send(
            "🔄 *Ticket Status Updated*\n".
            "Title: {$ticket->title}\n".
            "From: {$oldStatus}\n".
            "To: {$newStatus}\n".
            "Progress: {$ticket->progress_percentage}%"
        );
    }

    public static function notifyTicketProgressChanged(Ticket $ticket, int $oldProgress, int $newProgress): void
    {
        $recipients = self::uniqueUsers(collect([
            $ticket->creator,
            $ticket->assignee,
        ]));

        if ($recipients->isEmpty()) {
            return;
        }

        self::storeForUsers(
            $recipients,
            'ticket_progress_changed',
            'Ticket progress updated',
            "Ticket {$ticket->title} progress changed from {$oldProgress}% to {$newProgress}%.",
            [
                'ticket_id' => $ticket->id,
                'old_progress' => $oldProgress,
                'new_progress' => $newProgress,
                'status' => $ticket->status,
            ]
        );
    }

    public static function notifyTicketCommentAdded(Ticket $ticket, string $user, string $comment): void
    {
        $recipients = self::uniqueUsers(collect([
            $ticket->creator,
            $ticket->assignee,
        ]));

        if ($recipients->isEmpty()) {
            return;
        }

        self::storeForUsers(
            $recipients,
            'ticket_comment_added',
            'New comment on ticket',
            "{$user} added a comment on {$ticket->title}: \"{$comment}\"",
            ['ticket_id' => $ticket->id]
        );

        self::send(
            "💬 *New Comment on Ticket*\n".
            "Ticket: {$ticket->title}\n".
            "User: {$user}\n".
            "Comment: \"{$comment}\""
        );
    }

    private static function storeForUsers(Collection $users, string $type, string $title, string $message, array $data = []): void
    {
        $users->each(function (User $user) use ($type, $title, $message, $data): void {
            UserNotification::create([
                'user_id' => $user->id,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'data' => $data,
            ]);
        });
    }

    private static function uniqueUsers(Collection $users): Collection
    {
        return $users
            ->filter(fn ($user) => $user instanceof User)
            ->unique('id')
            ->values();
    }
}
