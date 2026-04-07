<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\MonitoringHost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class MonitoringController extends Controller
{
    /** Safe fields — never return SSH credentials to frontend */
    private const SAFE_FIELDS = ['id', 'name', 'type', 'ip_address', 'container_name', 'status', 'last_error', 'last_checked_at', 'created_at'];

    public function index()
    {
        // Strip credentials from list — frontend does NOT need SSH password/username
        return response()->json(MonitoringHost::select(self::SAFE_FIELDS)->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'type'           => 'required|in:server,router,nvr,docker,other',
            'ip_address'     => 'required|ip',
            'container_name' => 'nullable|string|max:255',
            'username'       => 'nullable|string|max:128',
            'password'       => 'nullable|string|max:255',
        ]);

        $host = MonitoringHost::create($validated + ['status' => 'unknown']);

        AuditLog::create([
            'user_id'     => Auth::id(),
            'action'      => 'CREATE_MONITORING_HOST',
            'module'      => 'monitoring',
            'description' => "Added monitoring host: {$host->name} ({$host->ip_address})",
            'ip_address'  => $request->ip(),
        ]);

        return response()->json($this->safeHost($host), 201);
    }

    public function show(Request $request, MonitoringHost $monitoring)
    {
        AuditLog::create([
            'user_id'     => Auth::id(),
            'action'      => 'VIEW_MONITORING_HOST',
            'module'      => 'monitoring',
            'description' => "Viewed monitoring host details: {$monitoring->name}",
            'ip_address'  => $request->ip(),
        ]);

        // Return safe fields + tickets, but NO SSH credentials
        $data = $monitoring->only(self::SAFE_FIELDS);
        $data['tickets'] = $monitoring->tickets()->latest()->get();
        $data['has_credentials'] = !empty($monitoring->username);

        return response()->json($data);
    }

    public function update(Request $request, MonitoringHost $monitoring)
    {
        $validated = $request->validate([
            'name'           => 'sometimes|string|max:255',
            'type'           => 'sometimes|in:server,router,nvr,docker,other',
            'ip_address'     => 'sometimes|ip',
            'container_name' => 'nullable|string|max:255',
            'username'       => 'nullable|string|max:128',
            'password'       => 'nullable|string|max:255',
            'status'         => 'sometimes|in:up,down,unknown',
        ]);

        $monitoring->update($validated);

        AuditLog::create([
            'user_id'     => Auth::id(),
            'action'      => 'UPDATE_MONITORING_HOST',
            'module'      => 'monitoring',
            'description' => "Updated monitoring host: {$monitoring->name}",
            'ip_address'  => $request->ip(),
        ]);

        return response()->json($this->safeHost($monitoring));
    }

    public function destroy(Request $request, MonitoringHost $monitoring)
    {
        $name = $monitoring->name;
        $monitoring->delete();

        AuditLog::create([
            'user_id'     => Auth::id(),
            'action'      => 'DELETE_MONITORING_HOST',
            'module'      => 'monitoring',
            'description' => "Deleted monitoring host: {$name}",
            'ip_address'  => $request->ip(),
        ]);

        return response()->json(null, 204);
    }

    /**
     * Reveal SSH credentials for a monitoring host — requires password re-confirmation.
     * Accessible only to admin & technician (enforced in routes).
     */
    public function revealCredentials(Request $request, MonitoringHost $monitoring)
    {
        $request->validate(['password' => 'required|string|min:8|max:255']);

        if (!Hash::check($request->password, $request->user()->password)) {
            return response()->json(['message' => 'Password confirmation failed.'], 422);
        }

        AuditLog::create([
            'user_id'     => Auth::id(),
            'action'      => 'REVEAL_MONITORING_CREDENTIALS',
            'module'      => 'monitoring',
            'description' => "Revealed SSH credentials for: {$monitoring->name} ({$monitoring->ip_address})",
            'ip_address'  => $request->ip(),
        ]);

        return response()->json([
            'username' => $monitoring->username,
            'password' => $monitoring->password,
        ]);
    }

    public function check(MonitoringHost $monitoring)
    {
        $ip     = $monitoring->ip_address;
        $status = 'down';
        $error  = null;

        if (in_array($monitoring->type, ['server', 'router', 'nvr'])) {
            $output = [];
            $result = -1;
            exec('ping -c 1 -W 2 ' . escapeshellarg($ip), $output, $result);

            if ($result === 0) {
                $status = 'up';
            } else {
                $status = 'down';
                $error  = 'Device is unreachable via network ping.';
            }
        } elseif ($monitoring->type === 'docker') {
            if (!$monitoring->container_name) {
                $error  = 'Container name is required for Docker monitoring.';
                $status = 'unknown';
            } else {
                $status = 'up';
            }
        } else {
            $status = 'unknown';
        }

        $monitoring->update([
            'status'          => $status,
            'last_error'      => $error,
            'last_checked_at' => now(),
        ]);

        if ($status === 'down') {
            \App\Services\NotificationService::send(
                "🚨 *Device Down!* \nHost: {$monitoring->name} \nIP: {$monitoring->ip_address} \nError: {$error}"
            );
        }

        return response()->json($monitoring->only(self::SAFE_FIELDS) + ['last_error' => $monitoring->last_error]);
    }

    public function checkAll()
    {
        $hosts   = MonitoringHost::all();
        $results = [];
        foreach ($hosts as $host) {
            $results[] = $this->check($host)->original;
        }
        return response()->json($results);
    }

    private function safeHost(MonitoringHost $host): array
    {
        return array_merge(
            $host->only(self::SAFE_FIELDS),
            ['has_credentials' => !empty($host->username)]
        );
    }
}
