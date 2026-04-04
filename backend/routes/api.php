<?php

use App\Http\Controllers\AssetController;
use App\Http\Controllers\AssetUnitController;
use App\Http\Controllers\MonitoringController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PageGateController;
use App\Http\Controllers\SettingsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('page-gates/{page}/verify', [PageGateController::class, 'verify'])->middleware('throttle:page-gate');

    // Asset Management
    Route::get('assets', [AssetController::class, 'index']);
    Route::get('assets/{asset}', [AssetController::class, 'show']);
    Route::get('asset-units', [AssetUnitController::class, 'index']);
    Route::get('asset-units/{assetUnit}', [AssetUnitController::class, 'show']);

    Route::middleware('role:admin,technician')->group(function () {
        Route::post('assets', [AssetController::class, 'store']);
        Route::put('assets/{asset}', [AssetController::class, 'update']);
        Route::patch('assets/{asset}', [AssetController::class, 'update']);
        Route::delete('assets/{asset}', [AssetController::class, 'destroy']);

        Route::post('asset-units', [AssetUnitController::class, 'store']);
        Route::put('asset-units/{assetUnit}', [AssetUnitController::class, 'update']);
        Route::patch('asset-units/{assetUnit}', [AssetUnitController::class, 'update']);
        Route::delete('asset-units/{assetUnit}', [AssetUnitController::class, 'destroy']);
    });

    // Tickets (all authenticated users)
    Route::post('tickets/{ticket}/activity', [TicketController::class, 'addActivity']);
    Route::apiResource('tickets', TicketController::class);

    // Notifications
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllRead']);
    Route::patch('notifications/{notification}/read', [NotificationController::class, 'markRead']);

    // Settings
    Route::get('settings', [SettingsController::class, 'index']);
    Route::put('settings/password', [SettingsController::class, 'updatePassword'])->middleware('throttle:sensitive-actions');

    // ──────────────────────────────────────────────
    //  RESTRICTED: Admin & Technician only
    // ──────────────────────────────────────────────

    // Monitoring System — restricted to admin & technician
    Route::middleware('role:admin,technician')->group(function () {
        Route::get('monitoring/check-all', [MonitoringController::class, 'checkAll'])->middleware('throttle:monitoring-check');
        Route::post('monitoring/check-all', [MonitoringController::class, 'checkAll'])->middleware('throttle:monitoring-check');
        Route::post('monitoring/{monitoring}/check', [MonitoringController::class, 'check'])->middleware('throttle:monitoring-check');
        Route::post('monitoring/{monitoring}/reveal-credentials', [MonitoringController::class, 'revealCredentials'])->middleware('throttle:sensitive-actions');
        Route::apiResource('monitoring', MonitoringController::class);
    });

    // Audit Logs — Admin only
    Route::middleware('role:admin')->group(function () {
        Route::get('audit-logs', [AuditLogController::class, 'index']);
        Route::get('audit-logs/{auditLog}', [AuditLogController::class, 'show']);
    });
});
