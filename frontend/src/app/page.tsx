'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  CircleAlert,
  Clock3,
  HardDrive,
  Monitor,
  Router,
  ShieldAlert,
  Ticket,
  Waypoints,
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { useUIStore } from '@/store/ui';
import { MonitoringHost, Ticket as TicketType, AssetUnit } from '@/types';

export default function DashboardPage() {
  const { searchQuery, dateFilter } = useUIStore();
  const [stats, setStats] = useState({
    totalHosts: 0,
    activeHosts: 0,
    downHosts: 0,
    totalAssets: 0,
    usedAssets: 0,
    brokenAssets: 0,
    repairAssets: 0,
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    criticalTickets: 0,
  });
  const [allHosts, setAllHosts] = useState<MonitoringHost[]>([]);
  const [allAssets, setAllAssets] = useState<AssetUnit[]>([]);
  const [allTickets, setAllTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [hostsRes, assetsRes, ticketsRes] = await Promise.allSettled([
          api.get('/monitoring'),
          api.get('/asset-units'),
          api.get('/tickets'),
        ]);

        if (hostsRes.status === 'fulfilled') {
          setAllHosts(hostsRes.value.data);
        } else {
          setAllHosts([]);
        }

        if (assetsRes.status === 'fulfilled') {
          setAllAssets(assetsRes.value.data);
        } else {
          setAllAssets([]);
        }

        if (ticketsRes.status === 'fulfilled') {
          setAllTickets(ticketsRes.value.data);
        } else {
          setAllTickets([]);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const filterByDate = useCallback((dateStr: string) => {
    if (dateFilter === 'all') return true;
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (dateFilter === 'today') {
      return date.toDateString() === now.toDateString();
    }
    if (dateFilter === '7days') return diffDays <= 7;
    if (dateFilter === '30days') return diffDays <= 30;
    return true;
  }, [dateFilter]);

  const filteredHosts = useMemo(() => {
    return allHosts.filter(h => {
      const matchesSearch = !searchQuery || 
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        h.ip_address.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch && filterByDate(h.created_at);
    });
  }, [allHosts, searchQuery, dateFilter]);

  const filteredAssets = useMemo(() => {
    return allAssets.filter(a => {
      const matchesSearch = !searchQuery || 
        a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.serial_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.branch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.asset?.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (a.asset?.model?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      return matchesSearch && filterByDate(a.created_at);
    });
  }, [allAssets, searchQuery, dateFilter]);

  const filteredTickets = useMemo(() => {
    return allTickets.filter(t => {
      const matchesSearch = !searchQuery || 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch && filterByDate(t.created_at);
    });
  }, [allTickets, searchQuery, dateFilter]);

  const recentTickets = useMemo(() => filteredTickets.slice(0, 6), [filteredTickets]);

  // Update Stats based on filtered data
  useEffect(() => {
    setStats({
      totalHosts: filteredHosts.length,
      activeHosts: filteredHosts.filter(h => h.status === 'up').length,
      downHosts: filteredHosts.filter(h => h.status === 'down').length,
      totalAssets: filteredAssets.length,
      usedAssets: filteredAssets.filter(a => a.status === 'used').length,
      brokenAssets: filteredAssets.filter(a => a.status === 'broken').length,
      repairAssets: filteredAssets.filter(a => a.status === 'repair').length,
      totalTickets: filteredTickets.length,
      openTickets: filteredTickets.filter(t => t.status === 'open').length,
      inProgressTickets: filteredTickets.filter(t => t.status === 'in_progress').length,
      criticalTickets: filteredTickets.filter(t => t.priority === 'critical').length,
    });
  }, [filteredHosts, filteredAssets, filteredTickets]);

  const hostTypeBars = useMemo(() => {
    const config = [
      { key: 'server', label: 'Server', icon: HardDrive },
      { key: 'router', label: 'Router', icon: Router },
      { key: 'nvr', label: 'NVR', icon: Waypoints },
      { key: 'docker', label: 'Docker', icon: Boxes },
      { key: 'other', label: 'Other', icon: Monitor },
    ] as const;

    return config.map((item) => {
      const total = filteredHosts.filter((host) => host.type === item.key).length;
      const down = filteredHosts.filter((host) => host.type === item.key && host.status === 'down').length;
      return { ...item, total, down };
    });
  }, [filteredHosts]);

  const ticketPrioritySegments = useMemo(() => {
    const priorities = [
      { key: 'critical', label: 'Critical', color: '#ef4444' },
      { key: 'high', label: 'High', color: '#f97316' },
      { key: 'medium', label: 'Medium', color: '#f59e0b' },
      { key: 'low', label: 'Low', color: '#10b981' },
    ] as const;

    // Filter out DONE tickets as requested: "sinkronkan dengan berapa tiket yang sdh selesai"
    const activeTickets = filteredTickets.filter(t => t.status !== 'done');
    const totalActive = Math.max(activeTickets.length, 0);
    
    if (totalActive === 0) return [];

    let cumulative = 0;
    return priorities.map((priority) => {
      const value = activeTickets.filter((ticket) => ticket.priority === priority.key).length;
      const percentage = (value / totalActive) * 100;
      const segment = {
        ...priority,
        value,
        percentage,
        start: cumulative,
      };
      cumulative += percentage;
      return segment;
    }).filter(s => s.value > 0);
  }, [filteredTickets]);

  const assetStatusBreakdown = useMemo(() => {
    const total = Math.max(filteredAssets.length, 1);
    return [
      { label: 'Available', value: filteredAssets.filter((asset) => asset.status === 'available').length, color: 'bg-emerald-400' },
      { label: 'Used', value: filteredAssets.filter((asset) => asset.status === 'used').length, color: 'bg-sky-400' },
      { label: 'Repair', value: filteredAssets.filter((asset) => asset.status === 'repair').length, color: 'bg-amber-400' },
      { label: 'Broken', value: filteredAssets.filter((asset) => asset.status === 'broken').length, color: 'bg-rose-400' },
    ].map((item) => ({
      ...item,
      percentage: Math.round((item.value / total) * 100),
    }));
  }, [filteredAssets]);

  const branchDistribution = useMemo(() => {
    const branchMap = new Map<string, number>();
    for (const asset of filteredAssets) {
      const branch = asset.branch?.trim() || 'Unassigned';
      branchMap.set(branch, (branchMap.get(branch) || 0) + 1);
    }
    const total = Math.max(filteredAssets.length, 1);
    return Array.from(branchMap.entries())
      .map(([branch, value]) => ({
        branch,
        value,
        percentage: Math.round((value / total) * 100),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [filteredAssets]);

  const statCards = [
    {
      label: 'Monitored nodes',
      value: stats.totalHosts,
      trend: `${Math.round((stats.activeHosts / Math.max(stats.totalHosts, 1)) * 100)}% healthy`,
      icon: Monitor,
      tone: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Asset inventory',
      value: stats.totalAssets,
      trend: `${stats.usedAssets} in use`,
      icon: Boxes,
      tone: 'text-sky-600',
      bg: 'bg-sky-50',
    },
    {
      label: 'Active incidents',
      value: stats.openTickets + stats.inProgressTickets,
      trend: `${stats.criticalTickets} critical`,
      icon: Ticket,
      tone: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Assets at risk',
      value: stats.brokenAssets + stats.repairAssets,
      trend: `${stats.downHosts} host down`,
      icon: ShieldAlert,
      tone: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  const donutStyle = useMemo(() => {
    if (!ticketPrioritySegments.length) {
      return { background: '#f0fdf9' };
    }

    const gradients = ticketPrioritySegments
      .map((segment) => {
        const end = segment.start + segment.percentage;
        return `${segment.color} ${segment.start}% ${end}%`;
      })
      .join(', ');

    return {
      background: `conic-gradient(${gradients})`,
    };
  }, [ticketPrioritySegments]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-[28px] bg-white/80 shadow-sm"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.8fr_1fr]">
          <div className="h-[22rem] animate-pulse rounded-[32px] bg-white/80"></div>
          <div className="h-[22rem] animate-pulse rounded-[32px] bg-white/80"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-premium flex items-start justify-between"
          >
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">{stat.value}</h3>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{stat.trend}</p>
            </div>
            <div className={`rounded-2xl p-3 ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.tone}`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.75fr_1fr]">
        <section className="card-premium overflow-hidden">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Realtime overview</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Infrastructure Monitoring</h2>
            </div>
            <div className="rounded-full bg-[#eef6f2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Live matrix
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {hostTypeBars.map((item, index) => {
              const barBase = Math.max(...hostTypeBars.map((bar) => bar.total), 1);
              const totalHeight = `${Math.max((item.total / barBase) * 220, item.total > 0 ? 24 : 12)}px`;
              const downHeight = `${Math.max((item.down / barBase) * 220, item.down > 0 ? 20 : 10)}px`;

              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * index }}
                  className="flex flex-col items-center"
                >
                  <div className="flex h-[280px] w-full items-end justify-center gap-2 rounded-[28px] bg-slate-50/50 px-3 pb-6 pt-8 transition-colors hover:bg-white hover:shadow-inner">
                    <div className="w-4 rounded-full bg-[#10b981]" style={{ height: totalHeight }} />
                    <div className="w-4 rounded-full bg-[#ef4444]" style={{ height: downHeight }} />
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <item.icon className="h-4 w-4 text-slate-400" />
                    <span>{item.label}</span>
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                    {item.total} nodes / {item.down} down
                  </p>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-12 flex flex-wrap gap-8 text-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
              Total by type
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
              Down by type
            </div>
          </div>
        </section>

        <section className="card-premium">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Ticket analytics</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Priority spread</h2>
          </div>

          <div className="flex flex-col gap-8">
            <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-full p-5" style={donutStyle}>
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white text-center shadow-inner">
                <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Active</span>
                <span className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">
                  {filteredTickets.filter(t => t.status !== 'done').length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {ticketPrioritySegments.map((segment) => (
                <div key={segment.key} className="rounded-2xl bg-white/50 border border-slate-100/50 px-4 py-3 transition-all hover:bg-white hover:shadow-md hover:border-slate-200 group">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <span className="h-3 w-3 rounded-full ring-2 ring-white shadow-[0_0_8px_rgba(0,0,0,0.05)] transition-transform group-hover:scale-110" style={{ backgroundColor: segment.color }} />
                    {segment.label}
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <span className="text-2xl font-semibold tracking-tight text-slate-900">{segment.value}</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {Math.round(segment.percentage)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr_0.95fr]">
        <section className="card-premium">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Field activity</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Recent tickets</h2>
            </div>
            <button
              onClick={() => (window.location.href = '/tickets')}
              className="flex items-center gap-2 text-sm font-semibold text-primary"
            >
              View all <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            {recentTickets.length > 0 ? (
              recentTickets.map((ticket: TicketType, i: number) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-4 rounded-[24px] border border-slate-100/50 bg-white/50 px-4 py-4 transition-all hover:bg-white hover:shadow-md hover:border-slate-200"
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${ticket.priority === 'critical'
                        ? 'bg-red-100 text-red-700'
                        : ticket.priority === 'high'
                          ? 'bg-orange-100 text-orange-700'
                          : ticket.priority === 'medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                    {ticket.priority === 'critical' ? (
                      <CircleAlert className="h-5 w-5" />
                    ) : (
                      <Ticket className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{ticket.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {ticket.assignee?.name || ticket.creator?.name || 'Unassigned'} •{' '}
                      {new Date(ticket.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-sm">
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex min-h-60 flex-col items-center justify-center text-slate-400">
                <CheckCircle2 className="mb-3 h-10 w-10 opacity-30" />
                <p>No ticket activity yet.</p>
              </div>
            )}
          </div>
        </section>

        <section className="card-premium">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Asset status</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Unit condition</h2>
          </div>

          <div className="space-y-4">
            {assetStatusBreakdown.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">{item.label}</span>
                  <span className="text-slate-400">{item.value} units</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[24px] bg-[#f8fbfa] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Requires attention</p>
                <p className="text-xs text-slate-500">{stats.brokenAssets + stats.repairAssets} units need action</p>
              </div>
            </div>
          </div>
        </section>

        <section className="card-premium">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Deployment map</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Assets by branch</h2>
          </div>

          <div className="space-y-4">
            {branchDistribution.length > 0 ? (
              branchDistribution.map((branch) => (
                <div key={branch.branch} className="flex items-center justify-between rounded-[22px] bg-white/50 border border-slate-100/50 px-4 py-3 transition-all hover:bg-white hover:shadow-md hover:border-slate-200">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{branch.branch}</p>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{branch.value} units</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">{branch.percentage}%</span>
                </div>
              ))
            ) : (
              <div className="flex min-h-60 flex-col items-center justify-center text-slate-400">
                <Clock3 className="mb-3 h-10 w-10 opacity-30" />
                <p>No branch distribution yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
