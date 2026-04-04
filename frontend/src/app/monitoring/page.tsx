'use client';

import { useEffect, useMemo, useState } from 'react';
import { 
  Plus, 
  Monitor, 
  RefreshCcw, 
  Server,
  Network,
  Cpu,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  X,
  Eye,
  Play,
  Pencil,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import { useUIStore } from '@/store/ui';
import { MonitoringHost } from '@/types';
import { cn } from '@/lib/utils';
import PageGate from '@/components/PageGate';
import axios from 'axios';

// ... (previous icons)

export default function MonitoringPage() {
  const { searchQuery } = useUIStore();
  const [hosts, setHosts] = useState<MonitoringHost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedHost, setSelectedHost] = useState<MonitoringHost | null>(null);
  const [actionMenuOpenFor, setActionMenuOpenFor] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHost, setEditingHost] = useState<MonitoringHost | null>(null);
  const [editHostData, setEditHostData] = useState({
    name: '',
    type: 'server' as 'server' | 'router' | 'nvr' | 'docker' | 'other',
    ip_address: '',
    container_name: '',
    username: '',
    password: ''
  });

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        actionMenuOpenFor !== null &&
        !target.closest('.host-menu-container') &&
        !target.closest('.host-menu-trigger')
      ) {
        setActionMenuOpenFor(null);
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [actionMenuOpenFor]);

  const [newHost, setNewHost] = useState({
    name: '',
    type: 'server',
    ip_address: '',
    container_name: '',
    username: '',
    password: ''
  });

  const filteredHosts = useMemo(() => {
    return hosts.filter((host: MonitoringHost) => {
      const matchesSearch = !searchQuery || 
        host.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        host.ip_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        host.container_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [hosts, searchQuery]);

  useEffect(() => {
    fetchHosts();
  }, []);

  const fetchHosts = async () => {
    try {
      const { data } = await api.get(`/monitoring?t=${Date.now()}`);
      setHosts(data);
    } catch (error) {
      console.error('Failed to fetch hosts', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/monitoring', newHost);
      setShowAddModal(false);
      setNewHost({ name: '', type: 'server', ip_address: '', container_name: '', username: '', password: '' });
      fetchHosts();
    } catch (error) {
      console.error('Failed to create host', error);
    }
  };

  const checkAllHosts = async () => {
    setRefreshing(true);
    try {
      await api.post('/monitoring/check-all');
      await fetchHosts();
    } catch (error) {
      console.error('Failed to check all hosts', error);
    } finally {
      setRefreshing(false);
    }
  };

  const checkHost = async (hostId: number) => {
    try {
      await api.post(`/monitoring/${hostId}/check`);
      await fetchHosts();
    } catch (error) {
      console.error('Failed to check host', error);
    }
  };

  const deleteHost = async (hostId: number) => {
    if (!confirm('Hapus host ini?')) return;
    try {
      const response = await api.delete(`/monitoring/${hostId}`);
      if (response.status === 204 || response.status === 200) {
        alert('Host berhasil dihapus.');
        fetchHosts();
      }
    } catch (error) {
      console.error('Failed to delete host', error);
      alert('Gagal menghapus host.');
    }
  };

  const handleOpenEdit = (host: MonitoringHost) => {
    setEditingHost(host);
    setEditHostData({
      name: host.name,
      type: host.type,
      ip_address: host.ip_address,
      container_name: host.container_name || '',
      username: host.username || '',
      password: '' // Keep password empty for security, only update if typed
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHost) return;
    try {
      const response = await api.put(`/monitoring/${editingHost.id}`, editHostData);
      if (response.status === 200) {
        alert('Perubahan berhasil disimpan.');
        setShowEditModal(false);
        setEditingHost(null);
        await fetchHosts();
      }
    } catch (error: unknown) {
      console.error('Failed to update host', error);
      const msg = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to save changes.'
        : 'Failed to save changes.';
      alert(`Error: ${msg}`);
    }
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'down': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getHostTypeIcon = (type: string) => {
    switch (type) {
      case 'server': return <Server className="h-5 w-5" />;
      case 'router': return <Network className="h-5 w-5" />;
      case 'nvr': return <Eye className="h-5 w-5 text-indigo-500" />;
      case 'docker': return <Cpu className="h-5 w-5 text-sky-500" />;
      default: return <Cpu className="h-5 w-5" />;
    }
  };

  return (
    <PageGate pageKey="monitoring">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Active Monitoring</h1>
          <p className="text-slate-500">Real-time status of servers and network infrastructure</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={checkAllHosts}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            Sync All
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[rgba(21,104,187,0.24)] transition-all hover:opacity-90 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Host
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-white border border-slate-200 shadow-sm"></div>
          ))
        ) : filteredHosts.length > 0 ? (
          filteredHosts.map((host: MonitoringHost, i: number) => (
            <motion.div
              key={host.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(244,248,255,0.96)_100%)] p-5 transition-all hover:shadow-md"
            >
              {/* Status Indicator Bar */}
              <div className={cn(
                "absolute left-0 top-0 h-full w-1.5 rounded-l-2xl",
                host.status === 'up' ? "bg-emerald-500" : 
                host.status === 'down' ? "bg-red-500" : "bg-slate-300"
              )} />

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        host.status === 'up' ? "bg-emerald-50 text-emerald-600" : 
                        host.status === 'down' ? "bg-red-50 text-red-600" : 
                        "bg-slate-100 text-slate-500"
                      )}>
                        {getHostTypeIcon(host.type)}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground capitalize tracking-tight">{host.name}</h3>
                        <p className="text-[11px] font-medium text-slate-400 group-hover:text-slate-500 transition-colors uppercase tracking-wider">{host.ip_address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Current Status</span>
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(host.status)}
                        <span className={cn(
                          "font-bold uppercase tracking-wider",
                          host.status === 'up' ? "text-emerald-600" : 
                          host.status === 'down' ? "text-red-600" : "text-slate-400"
                        )}>
                          {host.status === 'up' ? 'Online' : host.status === 'down' ? 'Offline' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Last Checked</span>
                      <span className="text-slate-700">
                        {host.last_checked_at ? new Date(host.last_checked_at).toLocaleTimeString() : 'Never'}
                      </span>
                    </div>
                  </div>

                  {host.status === 'down' && host.last_error && (
                    <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-[10px] text-red-600">
                      <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                      <p className="line-clamp-2">Error: {host.last_error}</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHost(host);
                      setShowAnalyticsModal(true);
                    }}
                    className="flex-1 rounded-xl bg-[var(--primary-soft)] py-2.5 text-xs font-bold text-primary transition-all hover:bg-[#cfe3fb] active:scale-[0.98]"
                  >
                    Full Analytics
                  </button>
                  <div className="relative host-menu-container">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionMenuOpenFor((current) => (current === host.id ? null : host.id));
                      }}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-all hover:bg-slate-100 active:scale-95 host-menu-trigger"
                      aria-label="Host actions"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {actionMenuOpenFor === host.id && (
                      <div className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5 transition-all">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedHost(host);
                            setShowAnalyticsModal(true);
                            setActionMenuOpenFor(null);
                          }}
                          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-slate-200 transition-colors">
                            <Eye className="h-4 w-4" />
                          </div>
                          View analytics
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            checkHost(host.id);
                            setActionMenuOpenFor(null);
                          }}
                          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-slate-200 transition-colors">
                            <Play className="h-4 w-4" />
                          </div>
                          Check host
                        </button>
                        <div className="my-1 h-px bg-slate-100/50" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(host);
                            setActionMenuOpenFor(null);
                          }}
                          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-slate-200 transition-colors">
                            <Pencil className="h-4 w-4" />
                          </div>
                          Edit host
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteHost(host.id);
                            setActionMenuOpenFor(null);
                          }}
                          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:text-red-700"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 group-hover:bg-red-100 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </div>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
             <Monitor className="h-12 w-12 mb-4 opacity-20" />
             <p>No hosts monitored. Add your first system.</p>
          </div>
        )}
      </div>

      {/* Add Host Modal */}
      <AnimatePresence>
      {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-2xl"
            >
              <div className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Add Host</h2>
                    <p className="text-sm text-slate-500">Monitor a new server or device</p>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="rounded-full p-2 hover:bg-slate-100 text-slate-400">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleCreateHost}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Host Name</label>
                      <input 
                        required 
                        value={newHost.name}
                        onChange={e => setNewHost({...newHost, name: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 bg-[var(--surface-soft)] p-3 text-sm outline-none focus:border-primary focus:bg-white transition-all" 
                        placeholder="e.g. Main Web Server" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Type</label>
                        <select 
                          value={newHost.type}
                          onChange={e => setNewHost({...newHost, type: e.target.value})}
                          className="w-full rounded-xl border border-slate-200 bg-[var(--surface-soft)] p-3 text-sm outline-none focus:border-primary focus:bg-white transition-all"
                        >
                          <option value="server">Server</option>
                          <option value="router">Router (MikroTik)</option>
                          <option value="nvr">NVR (Hikvision)</option>
                          <option value="docker">Docker Container</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          {newHost.type === 'docker' ? 'Server/Host IP' : 'IP / Hostname'}
                        </label>
                        <input 
                          required 
                          value={newHost.ip_address}
                          onChange={e => setNewHost({...newHost, ip_address: e.target.value})}
                          className="w-full rounded-xl border border-slate-200 bg-[var(--surface-soft)] p-3 text-sm outline-none focus:border-primary focus:bg-white transition-all placeholder:text-slate-300" 
                          placeholder={newHost.type === 'docker' ? 'e.g. 203.0.113.10' : 'e.g. 198.51.100.10'} 
                        />
                      </div>
                    </div>

                    {newHost.type === 'docker' && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Container Name / ID</label>
                        <input 
                          required 
                          value={newHost.container_name}
                          onChange={e => setNewHost({...newHost, container_name: e.target.value})}
                          className="w-full rounded-xl border border-slate-200 bg-[var(--surface-soft)] p-3 text-sm outline-none focus:border-primary focus:bg-white transition-all" 
                          placeholder="e.g. web-app-prod" 
                        />
                      </div>
                    )}

                    <p className="text-[10px] text-slate-400 italic px-1">
                      {newHost.type === 'docker' 
                        ? '💡 Monitoring via SSH to host server + docker inspect.'
                        : newHost.type === 'nvr'
                        ? '💡 Monitoring network status NVR (Hikvision/Dahua).'
                        : '💡 Monitoring via ICMP Ping (Network reachability).'
                      }
                    </p>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {newHost.type === 'nvr' ? 'NVR Login User' : 'SSH/Login User'} (Optional)
                      </label>
                      <input 
                        value={newHost.username}
                        onChange={e => setNewHost({...newHost, username: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 bg-[var(--surface-soft)] p-3 text-sm outline-none focus:border-primary focus:bg-white transition-all" 
                        placeholder={newHost.type === 'nvr' ? 'admin' : 'root'} 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {newHost.type === 'nvr' ? 'NVR Login Pass' : 'SSH/Login Pass'} (Optional)
                      </label>
                      <input 
                        type="password"
                        value={newHost.password}
                        onChange={e => setNewHost({...newHost, password: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 bg-[var(--surface-soft)] p-3 text-sm outline-none focus:border-primary focus:bg-white transition-all" 
                        placeholder="••••••••" 
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-[rgba(21,104,187,0.18)] hover:opacity-90 transition-all active:scale-[0.98]"
                    >
                      Create Host
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {showEditModal && editingHost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditModal(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-2xl"
          >
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Edit Host</h2>
                  <p className="text-sm text-slate-500">Update the monitoring host details</p>
                </div>
                <button onClick={() => setShowEditModal(false)} className="rounded-full p-2 hover:bg-slate-100 text-slate-400">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form className="mt-8 space-y-4" onSubmit={handleSaveEdit}>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Host Name</label>
                  <input
                    required
                    value={editHostData.name}
                    onChange={(e) => setEditHostData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-[var(--surface-soft)] p-3 text-sm outline-none focus:border-primary focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Type</label>
                    <select
                      value={editHostData.type}
                      onChange={(e) =>
                        setEditHostData((prev) => ({
                          ...prev,
                          type: e.target.value as typeof prev.type,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-[var(--surface-soft)] p-3 text-sm outline-none focus:border-primary focus:bg-white transition-all"
                    >
                      <option value="server">Server</option>
                      <option value="router">Router (MikroTik)</option>
                      <option value="nvr">NVR (Hikvision)</option>
                      <option value="docker">Docker Container</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {editHostData.type === 'docker' ? 'Server/Host IP' : 'IP / Hostname'}
                    </label>
                    <input
                      required
                      value={editHostData.ip_address}
                      onChange={(e) => setEditHostData((prev) => ({ ...prev, ip_address: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-[var(--surface-soft)] p-3 text-sm outline-none focus:border-primary focus:bg-white transition-all"
                      placeholder={editHostData.type === 'docker' ? 'e.g. 203.0.113.10' : 'e.g. 198.51.100.10'}
                    />
                  </div>
                </div>

                {editHostData.type === 'docker' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Container Name / ID</label>
                    <input 
                      required 
                      value={editHostData.container_name}
                      onChange={e => setEditHostData({...editHostData, container_name: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 bg-[var(--surface-soft)] p-3 text-sm outline-none focus:border-primary focus:bg-white transition-all" 
                      placeholder="e.g. web-app-prod" 
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {editHostData.type === 'nvr' ? 'NVR Login User' : 'SSH/Login User'} (Optional)
                    </label>
                    <input
                      value={editHostData.username || ''}
                      onChange={(e) => setEditHostData((prev) => ({ ...prev, username: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-[var(--surface-soft)] p-3 text-sm outline-none focus:border-primary focus:bg-white transition-all"
                      placeholder={editHostData.type === 'nvr' ? 'admin' : 'root'}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {editHostData.type === 'nvr' ? 'NVR Login Pass' : 'SSH/Login Pass'} (Optional)
                    </label>
                    <input
                      type="password"
                      value={editHostData.password || ''}
                      onChange={(e) => setEditHostData((prev) => ({ ...prev, password: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-[var(--surface-soft)] p-3 text-sm outline-none focus:border-primary focus:bg-white transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 italic px-1">
                  {editHostData.type === 'docker' 
                    ? '💡 Monitoring via SSH to host server + docker inspect.'
                    : editHostData.type === 'nvr'
                    ? '💡 Monitoring network status NVR (Hikvision/Dahua).'
                    : '💡 Monitoring via ICMP Ping (Network reachability).'
                  }
                </p>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-[rgba(21,104,187,0.18)] hover:opacity-90 transition-all active:scale-[0.98]"
                  >
                    Save changes
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
      <AnimatePresence>
        {showAnalyticsModal && selectedHost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAnalyticsModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-2xl"
            >
              <div className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Host Analytics</h2>
                    <p className="text-sm text-slate-500">Realtime log/status summary for {selectedHost.name}</p>
                  </div>
                  <button onClick={() => setShowAnalyticsModal(false)} className="rounded-full p-2 hover:bg-slate-100 text-slate-400 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-6 space-y-4 text-sm text-slate-600">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900 capitalize">
                        {selectedHost.status}
                      </p>
                      <p className="text-xs text-slate-500">Last checked: {selectedHost.last_checked_at ? new Date(selectedHost.last_checked_at).toLocaleString() : 'Never'}</p>
                    </div>
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">IP / Type</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">{selectedHost.ip_address}</p>
                      <p className="text-xs text-slate-500">Type: {selectedHost.type}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Recent log/alert</p>
                    {selectedHost.last_error ? (
                      <p className="mt-2 text-sm text-slate-900">{selectedHost.last_error}</p>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">No recent error recorded.</p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Sync action</p>
                    <p className="mt-2 text-sm text-slate-500">Tekan “Sync All” kapan pun untuk panggil pengecekan ulang dari server dan tarik log terbaru.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </PageGate>
  );
}
