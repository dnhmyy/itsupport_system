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
import PaginationControls from '@/components/ui/PaginationControls';

type AssetType = 'laptop' | 'smartphone' | 'monitor' | 'mini_pc' | 'pc' | 'printer' | 'mouse_keyboard' | 'router' | 'switch' | 'cctv' | 'tv';
const ASSETS_PAGE_SIZE = 9;

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
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / ASSETS_PAGE_SIZE));
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * ASSETS_PAGE_SIZE,
    currentPage * ASSETS_PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Asset Inventory</h1>
          <p className="text-slate-500">Manage master assets and physical units</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          Add Master Asset
        </button>
      </div>

      <section className="hero-minimal">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Assets</p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Inventory</h2>
            <p className="max-w-2xl text-sm text-slate-500">
              Master asset list dan unit terkait dalam tampilan yang lebih ringkas.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Total</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{assets.length}</p>
            </div>
            <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Filtered</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{filteredAssets.length}</p>
            </div>
            <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Per Page</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{ASSETS_PAGE_SIZE}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-shell pl-11"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {ASSET_TYPES.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "whitespace-nowrap filter-chip",
                activeTab === tab.id
                  ? "filter-chip-active"
                  : ""
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
            <div key={i} className="h-48 animate-pulse rounded-[28px] border border-[var(--border)] bg-white/80 shadow-sm"></div>
          ))
        ) : paginatedAssets && paginatedAssets.length > 0 ? (
          paginatedAssets.map((asset, i) => {
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-primary">
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
                          <div className="absolute right-0 top-8 z-20 w-32 rounded-2xl border border-[var(--border)] bg-white p-1.5 shadow-xl">
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
                      {asset.brand} <span className="text-primary">{asset.model}</span>
                    </h3>
                    <p className="mt-1 text-xs text-slate-400 line-clamp-1 italic">
                       {asset.specification || 'General specification...'}
                    </p>
                  </div>

                  {branches.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                       {branches.map((b, idx) => (
                         <span key={idx} className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-2 py-1 text-[9px] font-bold text-slate-500">
                           {b}
                         </span>
                       ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-primary text-[10px] font-black text-white">
                      {asset.units_count || 0}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Units</span>
                  </div>
                  <button
                    onClick={() => window.location.href = `/assets/${asset.id}`}
                    className="group/btn flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-tighter transition-all hover:gap-2"
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

      <PaginationControls
        page={currentPage}
        totalPages={totalPages}
        totalItems={filteredAssets.length}
        onPageChange={setCurrentPage}
      />

      {/* Asset Modal */}
      <AnimatePresence>
        {showAssetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAssetModal(false)}
              className="absolute inset-0 bg-slate-950/35 backdrop-blur-[3px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="modal-shell w-full max-w-lg"
            >
              <div className="p-8">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
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
                        className="input-shell"
                        placeholder="e.g. Asus"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Model Name</label>
                      <input
                        required
                        value={assetForm.model}
                        onChange={e => setAssetForm({ ...assetForm, model: e.target.value })}
                        className="input-shell"
                        placeholder="e.g. Vivobook14"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Type</label>
                      <select
                        value={assetForm.type}
                        onChange={e => setAssetForm({ ...assetForm, type: e.target.value as AssetType })}
                        className="input-shell"
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
                        className="input-shell"
                        placeholder="e.g. Core i5, 8GB RAM, SSD 256GB"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAssetModal(false)}
                      className="flex-1 rounded-2xl bg-slate-100 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary flex-1 py-3"
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
