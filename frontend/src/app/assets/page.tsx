'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Database,
  MoreVertical,
  HardDrive,
  ChevronRight,
  Monitor,
  Laptop,
  Smartphone,
  Network,
  Printer,
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

type AssetType = 'laptop' | 'smartphone' | 'monitor' | 'mini_pc' | 'pc' | 'printer' | 'mouse_keyboard' | 'router' | 'switch' | 'cctv' | 'tv';

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

function getAssetDisplayName(asset: Asset) {
  return [asset.brand, asset.model].filter(Boolean).join(' ') || `Asset #${asset.id}`;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [actionMenuOpenFor, setActionMenuOpenFor] = useState<number | null>(null);

  const [assetForm, setAssetForm] = useState({
    type: 'pc' as AssetType,
    brand: '',
    model: '',
    specification: ''
  });

  const ASSET_TYPES = [
    { id: 'all', label: 'All Assets' },
    { id: 'laptop', label: 'Laptop' },
    { id: 'smartphone', label: 'HP (Smartphone)' },
    { id: 'monitor', label: 'Monitor' },
    { id: 'mini_pc', label: 'Mini PC' },
    { id: 'pc', label: 'PC' },
    { id: 'printer', label: 'Printer' },
    { id: 'mouse_keyboard', label: 'Mouse & Keyboard' },
    { id: 'router', label: 'Router' },
    { id: 'switch', label: 'Switch' },
    { id: 'cctv', label: 'CCTV' },
    { id: 'tv', label: 'TV' }
  ];

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const { data } = await api.get('/assets');
      setAssets(data);
    } catch (error) {
      console.error('Failed to fetch assets', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingAsset(null);
    setAssetForm({
      type: 'laptop',
      brand: '',
      model: '',
      specification: ''
    });
    setShowAssetModal(true);
  };

  const handleOpenEditModal = (asset: Asset) => {
    setEditingAsset(asset);
    setAssetForm({
      type: asset.type as AssetType,
      brand: asset.brand,
      model: asset.model || '',
      specification: asset.specification || ''
    });
    setShowAssetModal(true);
    setActionMenuOpenFor(null);
  };

  const handleSubmitAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAsset) {
        await api.put(`/assets/${editingAsset.id}`, assetForm);
      } else {
        await api.post('/assets', assetForm);
      }
      setShowAssetModal(false);
      fetchAssets();
    } catch (error) {
      console.error('Failed to save asset', error);
    }
  };

  const handleDeleteAsset = async (id: number) => {
    if (!confirm('Are you sure you want to delete this asset? All units under this asset will be affected.')) return;
    try {
      await api.delete(`/assets/${id}`);
      fetchAssets();
      setActionMenuOpenFor(null);
    } catch (error) {
      console.error('Failed to delete asset', error);
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = getAssetDisplayName(asset).toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.brand.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = activeTab === 'all' || asset.type === activeTab;

    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Asset Inventory</h1>
          <p className="text-slate-500">Manage master assets and physical units</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition-all hover:opacity-90 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Master Asset
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {ASSET_TYPES.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                activeTab === tab.id
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-900/10"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-white border border-slate-200 shadow-sm"></div>
          ))
        ) :        filteredAssets && filteredAssets.length > 0 ? (
          filteredAssets.map((asset, i) => {
            const branches = Array.from(new Set(asset.units?.map(u => u.branch).filter(Boolean))) || [];
            
            return (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group card-premium flex flex-col justify-between overflow-visible py-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      {getIconByType(asset.type)}
                    </div>
                    
                    <div className="flex items-center gap-2">
                       <div className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase text-slate-500">
                         {asset.type}
                       </div>
                       <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuOpenFor(actionMenuOpenFor === asset.id ? null : asset.id);
                          }}
                          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {actionMenuOpenFor === asset.id && (
                          <div className="absolute right-0 top-8 z-20 w-32 rounded-xl border border-slate-100 bg-white p-1 shadow-xl">
                            <button 
                              onClick={() => handleOpenEditModal(asset)}
                              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              Edit Category
                            </button>
                            <button 
                              onClick={() => handleDeleteAsset(asset.id)}
                              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-foreground uppercase tracking-tight line-clamp-1">
                      {asset.brand} <span className="text-emerald-600">{asset.model}</span>
                    </h3>
                    <p className="mt-1 text-xs text-slate-400 line-clamp-1 italic">
                       {asset.specification || 'General specification...'}
                    </p>
                  </div>

                  {branches.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                       {branches.map((b, idx) => (
                         <span key={idx} className="rounded bg-slate-50 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 border border-slate-100">
                           {b}
                         </span>
                       ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-emerald-600 text-[10px] font-black text-white">
                      {asset.units_count || 0}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Units</span>
                  </div>
                  <button
                    onClick={() => window.location.href = `/assets/${asset.id}`}
                    className="group/btn flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-tighter transition-all hover:gap-2"
                  >
                    Manage Units
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
            <Database className="h-12 w-12 mb-4 opacity-20" />
            <p>No assets found matching your search.</p>
          </div>
        )}
      </div>

      {/* Asset Modal */}
      <AnimatePresence>
        {showAssetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAssetModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl"
            >
              <div className="p-8">
                <h2 className="text-xl font-bold text-foreground">
                  {editingAsset ? 'Edit Master Asset' : 'Add Master Asset'}
                </h2>
                <p className="text-sm text-slate-500">
                  {editingAsset ? 'Modify asset category details' : 'Define a new category of system hardware'}
                </p>

                <form className="mt-8 space-y-4" onSubmit={handleSubmitAsset}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Brand</label>
                      <input
                        required
                        value={assetForm.brand}
                        onChange={e => setAssetForm({ ...assetForm, brand: e.target.value })}
                        className="w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-600 focus:bg-white transition-all"
                        placeholder="e.g. Asus"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Model Name</label>
                      <input
                        required
                        value={assetForm.model}
                        onChange={e => setAssetForm({ ...assetForm, model: e.target.value })}
                        className="w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-600 focus:bg-white transition-all"
                        placeholder="e.g. Vivobook14"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Type</label>
                      <select
                        value={assetForm.type}
                        onChange={e => setAssetForm({ ...assetForm, type: e.target.value as AssetType })}
                        className="w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-600 focus:bg-white transition-all"
                      >
                        <option value="pc">PC</option>
                        <option value="mini_pc">Mini PC</option>
                        <option value="laptop">Laptop</option>
                        <option value="printer">Printer</option>
                        <option value="monitor">Monitor</option>
                        <option value="tv">TV</option>
                        <option value="smartphone">HP (Smartphone)</option>
                        <option value="mouse_keyboard">Mouse & Keyboard</option>
                        <option value="router">Router</option>
                        <option value="switch">Switch</option>
                        <option value="cctv">CCTV</option>
                      </select>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">General Specifications</label>
                      <textarea
                        rows={3}
                        value={assetForm.specification}
                        onChange={e => setAssetForm({ ...assetForm, specification: e.target.value })}
                        className="w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-600 focus:bg-white transition-all"
                        placeholder="e.g. Core i5, 8GB RAM, SSD 256GB"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAssetModal(false)}
                      className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/10 hover:opacity-90 transition-all active:scale-[0.98]"
                    >
                      {editingAsset ? 'Update Asset' : 'Create Asset'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
