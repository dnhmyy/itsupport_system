'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  Clock,
  Gauge,
  Image as ImageIcon,
  MessageSquare,
  Paperclip,
  Plus,
  Save,
  Ticket,
  User as UserIcon,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import { useUIStore } from '@/store/ui';
import { Asset, AssetUnit, Ticket as TicketType } from '@/types';
import { cn } from '@/lib/utils';
import PaginationControls from '@/components/ui/PaginationControls';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';

// ... (previous imports)

type TicketStatus = TicketType['status'];
type AssetUnitOption = AssetUnit & {
  assetLabel: string;
  displayName: string;
};
type AssetWithUnits = Asset & {
  units?: AssetUnit[];
};

const statusOptions: TicketStatus[] = ['open', 'in_progress', 'done'];
const TICKETS_PAGE_SIZE = 8;

function formatTimestamp(value?: string) {
  if (!value) return '-';
  return new Date(value).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'critical': return 'bg-red-100 text-red-700 border-red-200';
    case 'high': return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
    default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }
}

function getStatusIcon(status: TicketStatus) {
  switch (status) {
    case 'open': return <Clock className="h-4 w-4" />;
    case 'in_progress': return <Activity className="h-4 w-4" />;
    case 'done': return <CheckCircle2 className="h-4 w-4" />;
    default: return <CircleDashed className="h-4 w-4" />;
  }
}

function getStatusColor(status: TicketStatus) {
  switch (status) {
    case 'open': return 'bg-sky-50 text-sky-700';
    case 'in_progress': return 'bg-orange-50 text-orange-700';
    case 'done': return 'bg-emerald-50 text-emerald-700';
    default: return 'bg-slate-100 text-slate-700';
  }
}

export default function TicketsPage() {
  const { searchQuery } = useUIStore();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [savingTicket, setSavingTicket] = useState(false);
  const [commentSaving, setCommentSaving] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [detailForm, setDetailForm] = useState({
    status: 'open' as TicketStatus,
    progress_percentage: 0,
    progress_note: '',
  });
  const [detailComment, setDetailComment] = useState('');

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch = !searchQuery || 
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.creator?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.assignee?.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchQuery, statusFilter]);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium',
    asset_unit_id: '' as number | '',
  });
  const [assetUnits, setAssetUnits] = useState<AssetUnitOption[]>([]);
  const [unitSearchTerm, setUnitSearchTerm] = useState('');
  const [newTicketAttachment, setNewTicketAttachment] = useState<File | null>(null);
  const [detailAttachment, setDetailAttachment] = useState<File | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const url = statusFilter === 'all' ? '/tickets' : `/tickets?status=${statusFilter}`;
      const { data } = await api.get(url);
      setTickets(data);
    } catch (error) {
      console.error('Failed to fetch tickets', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const fetchAssetUnits = useCallback(async () => {
    try {
      const { data: assetsData } = await api.get<AssetWithUnits[]>('/assets');
      const allUnits: AssetUnitOption[] = [];
      for (const asset of assetsData) {
        if (asset.units && asset.units.length > 0) {
          const { data: detail } = await api.get<AssetWithUnits>(`/assets/${asset.id}`);
          const label = [detail.brand, detail.model].filter(Boolean).join(' ');
          detail.units?.forEach((u) => {
            allUnits.push({ ...u, assetLabel: label, displayName: u.name || u.serial_number || `Unit #${u.id}` });
          });
        }
      }
      setAssetUnits(allUnits);
    } catch (error) {
      console.error('Failed to fetch asset units', error);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const refreshTicketDetail = useCallback(async (ticketId: number) => {
    setDetailLoading(true);

    try {
      const { data } = await api.get(`/tickets/${ticketId}`);
      setSelectedTicket(data);
      setDetailForm({
        status: data.status,
        progress_percentage: data.progress_percentage ?? 0,
        progress_note: '',
      });
    } catch (error) {
      console.error('Failed to fetch ticket details', error);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleOpenTicket = async (ticketId: number) => {
    setShowDetailModal(true);
    setDetailComment('');
    setDetailAttachment(null);
    await refreshTicketDetail(ticketId);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingTicket(true);

    try {
      const formData = new FormData();
      formData.append('title', newTicket.title);
      formData.append('description', newTicket.description);
      formData.append('priority', newTicket.priority);
      if (newTicket.asset_unit_id) {
        formData.append('asset_unit_id', String(newTicket.asset_unit_id));
      }

      if (newTicketAttachment) {
        formData.append('attachment', newTicketAttachment);
      }

      await api.post('/tickets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowAddModal(false);
      setNewTicket({ title: '', description: '', priority: 'medium', asset_unit_id: '' });
      setNewTicketAttachment(null);
      setUnitSearchTerm('');
      fetchTickets();
    } catch (error) {
      console.error('Failed to create ticket', error);
    } finally {
      setCreatingTicket(false);
    }
  };

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTicket) {
      return;
    }

    setSavingTicket(true);

    try {
      const formData = new FormData();
      formData.append('_method', 'PATCH');
      formData.append('status', detailForm.status);
      formData.append('progress_percentage', String(detailForm.progress_percentage));
      
      if (detailForm.progress_note.trim()) {
        formData.append('progress_note', detailForm.progress_note.trim());
      }

      if (detailAttachment) {
        formData.append('attachment', detailAttachment);
      }

      await api.post(`/tickets/${selectedTicket.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await Promise.all([fetchTickets(), refreshTicketDetail(selectedTicket.id)]);
      setDetailAttachment(null);
    } catch (error) {
      console.error('Failed to update ticket', error);
    } finally {
      setSavingTicket(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTicket || !detailComment.trim()) {
      return;
    }

    setCommentSaving(true);

    try {
      await api.post(`/tickets/${selectedTicket.id}/activity`, {
        activity: detailComment.trim(),
      });

      setDetailComment('');
      await refreshTicketDetail(selectedTicket.id);
    } catch (error) {
      console.error('Failed to add ticket activity', error);
    } finally {
      setCommentSaving(false);
    }
  };

  const ticketSummary = useMemo(() => ({
    total: tickets.length,
    inProgress: tickets.filter((ticket) => ticket.status === 'in_progress').length,
    done: tickets.filter((ticket) => ticket.status === 'done').length,
  }), [tickets]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / TICKETS_PAGE_SIZE));
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * TICKETS_PAGE_SIZE;
    return filteredTickets.slice(start, start + TICKETS_PAGE_SIZE);
  }, [filteredTickets, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Support Tickets</h1>
          <p className="text-slate-500">Track issues, see full detail, and update progress in one place.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          New Ticket
        </button>
      </div>

      <section className="hero-minimal">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Tickets</p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Issue tracking</h2>
            <p className="max-w-2xl text-sm text-slate-500">
              Daftar tiket aktif dengan filter status dan detail progres.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Total</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{ticketSummary.total}</p>
            </div>
            <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">In Progress</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{ticketSummary.inProgress}</p>
            </div>
            <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Done</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{ticketSummary.done}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.55fr_0.45fr]">
        <div className="panel-soft p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-[var(--primary-soft)] p-3 text-primary">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Notification flow</p>
              <p className="text-sm font-semibold text-slate-900">New tickets notify `admin` and `technician` users.</p>
              <p className="text-sm text-slate-500">Assignment and progress updates notify the requester and active assignee.</p>
            </div>
          </div>
        </div>

        <div className="panel-soft flex items-center justify-between p-5 lg:flex-col lg:items-start lg:justify-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Current View</p>
          <p className="mt-0 text-3xl font-semibold text-slate-900 lg:mt-2">{filteredTickets.length}</p>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          {['all', 'open', 'in_progress', 'done'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'filter-chip',
                statusFilter === status
                  ? 'filter-chip-active'
                  : ''
              )}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

        <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-white/96 shadow-[var(--shadow-soft)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/90 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Ticket</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Progress</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Requester</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-8">
                      <div className="h-4 w-full rounded bg-slate-100"></div>
                    </td>
                  </tr>
                ))
              ) : paginatedTickets.length > 0 ? (
                paginatedTickets.map((ticket) => (
                  <tr key={ticket.id} className="group transition-colors hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <div className="flex max-w-sm flex-col gap-0.5">
                        <span className="font-bold text-foreground truncate">{ticket.title}</span>
                        <span className="text-xs text-slate-500 truncate">{ticket.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn('flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider', getStatusColor(ticket.status))}>
                        {getStatusIcon(ticket.status)}
                        {ticket.status.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="min-w-28">
                        <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                          <span>Progress</span>
                          <span>{ticket.progress_percentage ?? 0}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${ticket.progress_percentage ?? 0}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('inline-block rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest', getPriorityColor(ticket.priority))}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-500">
                          {ticket.creator?.profile_icon ? (
                            <ProfileAvatar iconId={ticket.creator.profile_icon} name={ticket.creator.name} />
                          ) : (
                            <UserIcon className="h-4 w-4" />
                          )}
                        </div>
                        <span className="text-xs font-medium text-slate-700">
                          {ticket.creator?.name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {formatTimestamp(ticket.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenTicket(ticket.id)}
                        className="rounded-2xl p-2 text-slate-400 transition-all hover:bg-white hover:text-primary hover:shadow-sm"
                      >
                        <ArrowUpRight className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Ticket className="h-10 w-10 opacity-20" />
                      <p>No tickets found in this category.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PaginationControls
        page={currentPage}
        totalPages={totalPages}
        totalItems={filteredTickets.length}
        onPageChange={setCurrentPage}
      />

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-950/35 backdrop-blur-[3px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="modal-shell w-full max-w-xl"
              onAnimationStart={() => fetchAssetUnits()}
            >
              <div className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">New Ticket</h2>
                    <p className="text-sm text-slate-500">Report a new issue and attach an image if needed.</p>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleCreateTicket}>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Ticket Title</label>
                    <input
                      required
                      value={newTicket.title}
                      onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                      className="input-shell"
                      placeholder="e.g. Internet connection on floor 2 is down"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Priority Level</label>
                    <div className="flex gap-2">
                      {['low', 'medium', 'high', 'critical'].map((priority) => (
                        <button
                          key={priority}
                          type="button"
                          onClick={() => setNewTicket({ ...newTicket, priority })}
                          className={cn(
                            'flex-1 rounded-2xl border py-2 text-[10px] font-black uppercase tracking-wider transition-all',
                            newTicket.priority === priority
                              ? 'bg-primary border-primary text-white shadow-md shadow-[rgba(21,104,187,0.18)]'
                              : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                          )}
                        >
                          {priority}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
                    <textarea
                      required
                      rows={4}
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                      className="input-shell"
                      placeholder="Provide detailed context, impact, and symptoms..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Attachment Image</label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-[var(--border)] bg-slate-50 px-4 py-3 text-sm text-slate-500">
                      <Paperclip className="h-4 w-4" />
                      <span>{newTicketAttachment?.name || 'Upload screenshot or photo evidence'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setNewTicketAttachment(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Related Asset Unit <span className="font-normal text-slate-400">(Optional)</span></label>
                    <input
                      value={unitSearchTerm}
                      onChange={(e) => setUnitSearchTerm(e.target.value)}
                      className="input-shell"
                      placeholder="Search unit name or serial number..."
                    />
                    {unitSearchTerm && !newTicket.asset_unit_id && (
                      <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-100 bg-white shadow-lg">
                        {assetUnits
                          .filter(u =>
                            u.displayName.toLowerCase().includes(unitSearchTerm.toLowerCase()) ||
                            u.assetLabel.toLowerCase().includes(unitSearchTerm.toLowerCase()) ||
                            (u.branch || '').toLowerCase().includes(unitSearchTerm.toLowerCase())
                          )
                          .slice(0, 10)
                          .map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                setNewTicket({ ...newTicket, asset_unit_id: u.id });
                                setUnitSearchTerm(`${u.assetLabel} — ${u.displayName} (${u.branch || 'HO'})`);
                              }}
                              className="flex w-full items-center justify-between border-b border-slate-50 px-3 py-2 text-left text-xs transition-colors hover:bg-[var(--primary-soft)] last:border-0"
                            >
                              <div>
                                <p className="font-bold text-slate-700">{u.displayName}</p>
                                <p className="text-slate-400">{u.assetLabel} · {u.branch || 'HO'}</p>
                              </div>
                            </button>
                          ))}
                        {assetUnits.filter(u =>
                          u.displayName.toLowerCase().includes(unitSearchTerm.toLowerCase()) ||
                          u.assetLabel.toLowerCase().includes(unitSearchTerm.toLowerCase())
                        ).length === 0 && (
                          <p className="px-3 py-3 text-xs text-slate-400">No units found.</p>
                        )}
                      </div>
                    )}
                    {newTicket.asset_unit_id && (
                      <button
                        type="button"
                        onClick={() => { setNewTicket({ ...newTicket, asset_unit_id: '' }); setUnitSearchTerm(''); }}
                        className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        ✕ Clear selection
                      </button>
                    )}
                  </div>

                  <div className="flex items-start gap-2 rounded-xl border border-[var(--border)] bg-[rgba(220,236,255,0.45)] p-3 text-[11px] text-primary">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <p>Ticket baru akan membuat notifikasi ke admin dan technician. Update status dan progress setelah ticket dibuka akan mengirim notifikasi ke requester dan assignee.</p>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 rounded-2xl bg-slate-100 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creatingTicket}
                      className="btn-primary flex-1 py-3 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {creatingTicket ? 'Submitting...' : 'Submit Ticket'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDetailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailModal(false)}
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-[3px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 18 }}
              className="modal-shell max-h-[90vh] w-full max-w-6xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Ticket detail</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                    {selectedTicket?.title || 'Loading ticket...'}
                  </h2>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[calc(90vh-88px)] overflow-y-auto px-8 py-6">
                {detailLoading || !selectedTicket ? (
                  <div className="space-y-4">
                    <div className="h-8 w-64 animate-pulse rounded bg-slate-100" />
                    <div className="h-32 animate-pulse rounded-3xl bg-slate-100" />
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="h-64 animate-pulse rounded-3xl bg-slate-100" />
                      <div className="h-64 animate-pulse rounded-3xl bg-slate-100" />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="space-y-6">
                      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider', getStatusColor(selectedTicket.status))}>
                            {getStatusIcon(selectedTicket.status)}
                            {selectedTicket.status.replace('_', ' ')}
                          </span>
                          <span className={cn('rounded-lg border px-2 py-1 text-[10px] font-black uppercase tracking-widest', getPriorityColor(selectedTicket.priority))}>
                            {selectedTicket.priority}
                          </span>
                        </div>

                        <p className="mt-5 text-sm leading-7 text-slate-600">{selectedTicket.description}</p>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Requester</p>
                            <div className="mt-2 flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white text-slate-500 shadow-sm">
                                {selectedTicket.creator?.profile_icon ? (
                                  <ProfileAvatar iconId={selectedTicket.creator.profile_icon} name={selectedTicket.creator.name} />
                                ) : (
                                  <UserIcon className="h-5 w-5" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{selectedTicket.creator?.name || 'Unknown'}</p>
                                <p className="text-xs text-slate-500">{selectedTicket.creator?.email || '-'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Assigned to</p>
                            <p className="mt-2 text-sm font-semibold text-slate-900">{selectedTicket.assignee?.name || 'Unassigned'}</p>
                            <p className="text-xs text-slate-500">{selectedTicket.assignee?.email || 'No technician assigned yet'}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Created at</p>
                            <p className="mt-2 text-sm font-semibold text-slate-900">{formatTimestamp(selectedTicket.created_at)}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Last update</p>
                            <p className="mt-2 text-sm font-semibold text-slate-900">{formatTimestamp(selectedTicket.updated_at || selectedTicket.created_at)}</p>
                          </div>
                        </div>

                        {(selectedTicket.asset_unit || selectedTicket.monitoring_host) && (
                          <div className="mt-6 rounded-2xl border border-slate-100 p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Related item</p>
                            <div className="mt-3 space-y-2 text-sm text-slate-600">
                              {selectedTicket.asset_unit && (
                                <p>Asset unit: {selectedTicket.asset_unit.serial_number}</p>
                              )}
                              {selectedTicket.monitoring_host && (
                                <p>Monitoring host: {selectedTicket.monitoring_host.name} ({selectedTicket.monitoring_host.ip_address})</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Progress timeline</p>
                            <h3 className="mt-2 text-xl font-semibold text-slate-900">Activity log</h3>
                          </div>
                          <MessageSquare className="h-5 w-5 text-slate-300" />
                        </div>

                        <div className="mt-6 space-y-4 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-100 scrollbar-track-transparent">
                          {selectedTicket.activities && selectedTicket.activities.length > 0 ? (
                            selectedTicket.activities.slice().reverse().map((activity) => (
                              <div key={activity.id} className="flex gap-4 rounded-2xl border border-slate-100 p-4">
                                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-semibold text-slate-900">{activity.activity}</p>
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                      {activity.type.replace('_', ' ')}
                                    </span>
                                  </div>
                                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                    <span>{activity.user?.name || 'System'}</span>
                                    <span>{formatTimestamp(activity.created_at)}</span>
                                    {typeof activity.progress_to === 'number' && <span>Progress {activity.progress_to}%</span>}
                                    {activity.status_to && <span>Status {activity.status_to.replace('_', ' ')}</span>}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-400">
                              No activity recorded yet.
                            </div>
                          )}
                        </div>

                        <form className="mt-6 space-y-3" onSubmit={handleAddComment}>
                          <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Quick chat / reply</label>
                          <textarea
                            rows={3}
                            value={detailComment}
                            onChange={(e) => setDetailComment(e.target.value)}
                            className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm outline-none transition-all focus:border-emerald-600 focus:bg-white"
                            placeholder="Tulis balasan pesan atau pertanyaan..."
                          />
                          <button
                            type="submit"
                            disabled={commentSaving || !detailComment.trim()}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {commentSaving ? 'Saving...' : 'Send Message'}
                          </button>
                        </form>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <form onSubmit={handleUpdateTicket} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Execution</p>
                            <h3 className="mt-2 text-xl font-semibold text-slate-900">Status and progress</h3>
                          </div>
                          <Gauge className="h-5 w-5 text-slate-300" />
                        </div>

                        <div className="mt-6 space-y-5">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Status</label>
                            <div className="grid grid-cols-2 gap-2">
                              {statusOptions.map((status) => (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() => setDetailForm((current) => ({
                                    ...current,
                                    status,
                                    progress_percentage:
                                      status === 'done' || status === 'closed'
                                        ? 100
                                        : current.progress_percentage,
                                  }))}
                                  className={cn(
                                    'rounded-2xl border px-3 py-3 text-xs font-bold uppercase tracking-wider transition-all',
                                    detailForm.status === status
                                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                      : 'border-slate-100 bg-white text-slate-500 hover:bg-slate-50'
                                  )}
                                >
                                  {status.replace('_', ' ')}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Progress</label>
                              <span className="text-sm font-semibold text-slate-900">{detailForm.progress_percentage}%</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              {[25, 50, 75, 100].map((step) => (
                                <button
                                  key={step}
                                  type="button"
                                  onClick={() => setDetailForm((current) => ({ ...current, progress_percentage: step }))}
                                  className={cn(
                                    'rounded-2xl border px-3 py-2 text-xs font-bold transition-all',
                                    detailForm.progress_percentage === step
                                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                      : 'border-slate-100 bg-white text-slate-500 hover:bg-slate-50'
                                  )}
                                >
                                  {step}%
                                </button>
                              ))}
                            </div>
                            <div className="h-2 rounded-full bg-slate-100">
                              <div
                                className="h-2 rounded-full bg-emerald-500 transition-all"
                                style={{ width: `${detailForm.progress_percentage}%` }}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Progress Note</label>
                            <textarea
                              rows={3}
                              value={detailForm.progress_note}
                              onChange={(e) => setDetailForm((prev) => ({ ...prev, progress_note: e.target.value }))}
                              className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm outline-none transition-all focus:border-emerald-600 focus:bg-white"
                              placeholder="Explain what you did... (this will be logged with status)"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Attachment image</label>
                            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                              <Paperclip className="h-4 w-4" />
                              <span>{detailAttachment?.name || 'Replace attachment image'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => setDetailAttachment(e.target.files?.[0] || null)}
                              />
                            </label>
                          </div>

                          <button
                            type="submit"
                            disabled={savingTicket}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Save className="h-4 w-4" />
                            {savingTicket ? 'Saving...' : 'Save changes'}
                          </button>
                        </div>
                      </form>

                      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Attachment</p>
                            <h3 className="mt-2 text-xl font-semibold text-slate-900">Evidence image</h3>
                          </div>
                          <ImageIcon className="h-5 w-5 text-slate-300" />
                        </div>

                        {selectedTicket.attachment_url ? (
                          <div className="mt-6 space-y-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={selectedTicket.attachment_url}
                              alt={selectedTicket.attachment_original_name || selectedTicket.title}
                              className="h-64 w-full rounded-2xl object-cover"
                            />
                            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                              <p className="font-semibold text-slate-900">{selectedTicket.attachment_original_name || 'ticket-attachment'}</p>
                              <p className="mt-1 text-xs text-slate-500">{selectedTicket.attachment_mime_type || 'image/*'}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
                            No image attached to this ticket yet.
                          </div>
                        )}
                      </div>

                      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                          <CalendarClock className="h-5 w-5 text-slate-300" />
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Operational status</p>
                            <p className="mt-2 text-sm text-slate-600">Requester can see full report, current status, detailed timestamp, and progress percentage from the same ticket detail view.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
