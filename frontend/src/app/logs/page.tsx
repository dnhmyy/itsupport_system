'use client';

import { useEffect, useState } from 'react';
import { 
  History, 
  User
} from 'lucide-react';
import api from '@/lib/axios';
import { AuditLog } from '@/types';
import { cn } from '@/lib/utils';
import PageGate from '@/components/PageGate';

export default function LogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data } = await api.get('/audit-logs');
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('created') || act.includes('stored')) return 'text-emerald-600';
    if (act.includes('updated')) return 'text-emerald-600';
    if (act.includes('deleted')) return 'text-red-600';
    if (act.includes('viewed') || act.includes('accessed')) return 'text-orange-600';
    return 'text-slate-600';
  };

  return (
    <PageGate pageKey="analytics">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-slate-500">Complete history of system interactions and security events</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Module</th>
                <th className="px-6 py-4">Information</th>
                <th className="px-6 py-4">Date & IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-6">
                       <div className="h-4 w-full rounded bg-slate-100"></div>
                    </td>
                  </tr>
                ))
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className={cn("font-black uppercase tracking-widest text-[10px]", getActionColor(log.action))}>
                         {log.action}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                            <User className="h-4 w-4" />
                         </div>
                         <span className="font-medium text-slate-700">
                           {log.user?.name || 'System'}
                         </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-tight text-slate-600">
                         {log.module}
                       </span>
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                       <p className="truncate text-xs text-slate-600">{log.description}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-foreground font-medium">
                             {new Date(log.created_at).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                             IP: {log.ip_address || '::1'}
                          </span>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                     <div className="flex flex-col items-center gap-2">
                        <History className="h-10 w-10 opacity-20" />
                        <p>No audit records found.</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </PageGate>
  );
}
