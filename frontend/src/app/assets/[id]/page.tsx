'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  Plus, 
  ArrowLeft, 
  HardDrive, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  Wrench,
  Calendar,
  ShieldCheck,
  X,
  AlertCircle,
  Monitor,
  Laptop,
  Smartphone,
  Server,
  Network,
  Printer,
  MousePointer2,
  Keyboard,
  Cpu,
  Tv,
  Camera,
  Layers,
  PcCase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import { Asset } from '@/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function getAssetDisplayName(asset: Asset) {
  return [asset.brand, asset.model].filter(Boolean).join(' ') || `Asset #${asset.id}`;
}

function getIconByType(type: string) {
  switch (type) {
    case 'laptop': return <Laptop className="h-6 w-6" />;
    case 'smartphone': return <Smartphone className="h-6 w-6" />;
    case 'monitor': return <Monitor className="h-6 w-6" />;
    case 'mini_pc': return <Cpu className="h-6 w-6" />;
    case 'pc': return <PcCase className="h-6 w-6" />;
    case 'mouse_keyboard': return <Keyboard className="h-6 w-6" />;
    case 'router': return <Network className="h-6 w-6" />;
    case 'switch': return <Layers className="h-6 w-6" />;
    case 'cctv': return <Camera className="h-6 w-6" />;
    case 'tv': return <Tv className="h-6 w-6" />;
    case 'printer': return <Printer className="h-6 w-6" />;
    default: return <HardDrive className="h-6 w-6" />;
  }
}

export default function AssetUnitsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any | null>(null);
  const [actionMenuOpenFor, setActionMenuOpenFor] = useState<number | null>(null);
  
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyUnit, setHistoryUnit] = useState<any | null>(null);
  const [historyTickets, setHistoryTickets] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const [unitForm, setUnitForm] = useState({
    name: '',
    serial_number: '',
    specification: '',
    status: 'available',
    branch: '',
    received_at: '',
    warranty_expiry: '',
    assigned_to_user_id: '' as string | number,
    quantity: 1
  });

  const fetchAssetDetails = useCallback(async () => {
    try {
      const { data } = await api.get(`/assets/${id}`);
      setAsset(data);
    } catch (error) {
      console.error('Failed to fetch asset details', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAssetDetails();
  }, [fetchAssetDetails]);

  const handleOpenAddUnit = () => {
    setEditingUnit(null);
    setUnitForm({
      name: '',
      serial_number: '',
      specification: '',
      status: 'available',
      branch: '',
      received_at: '',
      warranty_expiry: '',
      assigned_to_user_id: '',
      quantity: 1
    });
    setShowAddModal(true);
  };

  const handleOpenEditUnit = (unit: any) => {
    setEditingUnit(unit);
    setUnitForm({
      name: unit.name || '',
      serial_number: unit.serial_number || '',
      specification: unit.specification || '',
      status: unit.status,
      branch: unit.branch || '',
      received_at: unit.received_at ? unit.received_at.split('T')[0] : '',
      warranty_expiry: unit.warranty_expiry ? unit.warranty_expiry.split('T')[0] : '',
      assigned_to_user_id: unit.assigned_to_user_id || '',
      quantity: 1
    });
    setShowAddModal(true);
    setActionMenuOpenFor(null);
  };

  const handleSubmitUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...unitForm,
        asset_id: Number(id),
        assigned_to_user_id: unitForm.assigned_to_user_id ? Number(unitForm.assigned_to_user_id) : null,
      };

      if (editingUnit) {
        await api.put(`/asset-units/${editingUnit.id}`, payload);
      } else {
        await api.post('/asset-units', payload);
      }
      
      setShowAddModal(false);
      fetchAssetDetails();
    } catch (error) {
      console.error('Failed to save unit', error);
    }
  };

  const handleOpenHistory = async (unit: any) => {
    setHistoryUnit(unit);
    setShowHistoryModal(true);
    setLoadingHistory(true);
    try {
      const { data } = await api.get(`/tickets?asset_unit_id=${unit.id}`);
      setHistoryTickets(data);
    } catch (error) {
      console.error('Failed to fetch history', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDeleteUnit = async (unitId: number) => {
    if (!confirm('Are you sure you want to delete this unit?')) return;
    try {
      await api.delete(`/asset-units/${unitId}`);
      fetchAssetDetails();
      setActionMenuOpenFor(null);
    } catch (error) {
      console.error('Failed to delete unit', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-100"></div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-white border border-slate-200"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!asset) return <div>Asset not found.</div>;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'used': return <Wrench className="h-4 w-4 text-emerald-600" />;
      case 'repair': return <Wrench className="h-4 w-4 text-orange-500" />;
      case 'broken': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/assets" className="rounded-full p-2 hover:bg-slate-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{getAssetDisplayName(asset)}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
               <span className="font-bold border border-emerald-600/30 bg-emerald-50/50 px-2 py-0.5 rounded-lg text-emerald-600 capitalize">{asset.type} — {asset.brand} {asset.model && `(${asset.model})`}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleOpenAddUnit}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition-all hover:opacity-90 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Unit
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {asset.units && asset.units.length > 0 ? (
          asset.units.map((unit, i) => (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="group card-premium flex flex-col justify-between overflow-visible p-4"
            >
              <div className="flex gap-4">
                 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                   {getIconByType(asset.type)}
                 </div>
                 
                 <div className="flex-1">
                   <div className="flex items-start justify-between">
                     <div>
                       <h4 className="font-bold text-foreground uppercase tracking-tight text-sm">
                         {unit.name || 'Unnamed Unit'}
                       </h4>
                       <p className="mt-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                         S/N: {unit.serial_number || 'NOT SPECIFIED'}
                       </p>
                     </div>
                     <div className="flex items-center gap-2">
                       <div className={cn(
                         "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                         unit.status === 'available' ? "bg-emerald-50 text-emerald-600" :
                         unit.status === 'used' ? "bg-blue-50 text-blue-600" :
                         "bg-slate-100 text-slate-500"
                       )}>
                         {unit.status}
                       </div>
                       
                       <div className="relative">
                         <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionMenuOpenFor(actionMenuOpenFor === unit.id ? null : unit.id);
                            }}
                            className="rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                         >
                           <MoreVertical className="h-4 w-4" />
                         </button>

                         {actionMenuOpenFor === unit.id && (
                           <div className="absolute right-0 top-6 z-10 w-32 rounded-xl border border-slate-100 bg-white p-1 shadow-xl">
                              <button 
                                onClick={() => handleOpenEditUnit(unit)}
                                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                Edit Unit
                              </button>
                              <button 
                                onClick={() => handleDeleteUnit(unit.id)}
                                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                Delete
                              </button>
                           </div>
                         )}
                       </div>
                     </div>
                   </div>

                   {unit.specification && (
                     <p className="mt-2 text-xs text-slate-500 line-clamp-2">
                       {unit.specification}
                     </p>
                   )}
                 </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                 <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{unit.received_at ? new Date(unit.received_at).toLocaleDateString() : 'Unknown'}</span>
                 </div>
                 <div className="flex items-center gap-1.5 text-[10px] text-orange-600 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>{unit.warranty_expiry ? new Date(unit.warranty_expiry).toLocaleDateString() : 'No Expiry'}</span>
                 </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                 <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase text-slate-600 tracking-wider">
                   {unit.branch || 'HO'}
                 </span>
                 <button 
                  onClick={() => handleOpenHistory(unit)}
                  className="text-[11px] font-bold text-emerald-600 hover:underline transition-all"
                 >
                    History
                 </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-slate-400">
            <p>No units added to this asset yet.</p>
          </div>
        )}
      </div>

       {/* Add Unit Modal */}
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
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl"
            >
              <div className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {editingUnit ? 'Edit Unit' : 'Add Unit'}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {editingUnit ? `Modify unit ${editingUnit.serial_number}` : `Register a new physical item for ${getAssetDisplayName(asset)}`}
                    </p>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="rounded-full p-2 hover:bg-slate-100 text-slate-400 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleSubmitUnit}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Unit Name</label>
                        <input 
                          value={unitForm.name}
                          onChange={e => setUnitForm({...unitForm, name: e.target.value})}
                          className="w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-600 focus:bg-white transition-all" 
                          placeholder="e.g. PC Kasir" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Qty (Batch)</label>
                        <input 
                          type="number"
                          min="1"
                          max="50"
                          disabled={!!editingUnit}
                          value={unitForm.quantity}
                          onChange={e => setUnitForm({...unitForm, quantity: parseInt(e.target.value) || 1})}
                          className="w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-600 focus:bg-white transition-all disabled:opacity-50" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Serial Number</label>
                        <input 
                          value={unitForm.serial_number}
                          onChange={e => setUnitForm({...unitForm, serial_number: e.target.value})}
                          className="w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-600 focus:bg-white transition-all" 
                          placeholder="e.g. SN12345678" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</label>
                        <select 
                          value={unitForm.status}
                          onChange={e => setUnitForm({...unitForm, status: e.target.value})}
                          className="w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-600 focus:bg-white transition-all"
                        >
                          <option value="available">Available</option>
                          <option value="used">Used</option>
                          <option value="repair">Repair</option>
                          <option value="broken">Broken</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Arrival Date</label>
                        <input 
                          type="date"
                          required
                          value={unitForm.received_at}
                          onChange={e => setUnitForm({...unitForm, received_at: e.target.value})}
                          className="w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-600 focus:bg-white transition-all" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Warranty Expiry</label>
                        <input 
                          type="date"
                          value={unitForm.warranty_expiry}
                          onChange={e => setUnitForm({...unitForm, warranty_expiry: e.target.value})}
                          className="w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-600 focus:bg-white transition-all" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Branch / Location</label>
                      <input 
                        value={unitForm.branch}
                        onChange={e => setUnitForm({...unitForm, branch: e.target.value})}
                        className="w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-600 focus:bg-white transition-all" 
                        placeholder="e.g. Head Office" 
                       />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Specifications (Optional)</label>
                      <textarea 
                        rows={2}
                        value={unitForm.specification}
                        onChange={e => setUnitForm({...unitForm, specification: e.target.value})}
                        className="w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-600 focus:bg-white transition-all" 
                        placeholder="SSD Upgrade, Extra RAM..." 
                      />
                    </div>
                    
                    <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-[10px] text-emerald-600">
                       <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                       <p>Tracking the arrival and warranty dates helps in lifecycle management and maintenance scheduling.</p>
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
                      className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/10 hover:opacity-90 transition-all active:scale-[0.98]"
                    >
                      {editingUnit ? 'Update Unit' : 'Register Unit'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

       {/* History Modal */}
       <AnimatePresence>
        {showHistoryModal && historyUnit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistoryModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Unit History
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {historyUnit.name || 'Unnamed Unit'} • {historyUnit.serial_number || 'No SN'}
                  </p>
                </div>
                <button onClick={() => setShowHistoryModal(false)} className="rounded-full p-2 hover:bg-slate-100 text-slate-400 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
                {loadingHistory ? (
                  <div className="py-12 text-center text-sm font-semibold text-slate-400 animate-pulse">
                    Loading medical records...
                  </div>
                ) : historyTickets.length > 0 ? (
                  <div className="space-y-4">
                    {historyTickets.map((ticket: any) => (
                      <div key={ticket.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-2">
                         <div className="flex items-start justify-between">
                            <div>
                               <h4 className="font-bold text-sm text-slate-800">{ticket.title}</h4>
                               <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ticket.description}</p>
                            </div>
                            <div className={cn(
                               "px-2 py-1 rounded text-[10px] font-bold uppercase",
                               ticket.status === 'open' ? 'bg-sky-50 text-sky-600' :
                               ticket.status === 'in_progress' ? 'bg-orange-50 text-orange-600' :
                               'bg-emerald-50 text-emerald-600'
                            )}>
                               {ticket.status}
                            </div>
                         </div>
                         <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400 font-medium">
                            <span>#{ticket.id}</span>
                            <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                            <span>By: {ticket.creator?.name || 'Unknown'}</span>
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-sm font-bold text-slate-300">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    No tickets found for this unit.
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
