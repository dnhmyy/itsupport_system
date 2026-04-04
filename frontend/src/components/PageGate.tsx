'use client';

import { useState, useEffect, useRef } from 'react';
import { Lock, ShieldCheck, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import api from '@/lib/axios';

interface Props {
  pageKey: string; // unique key per page e.g. 'monitoring', 'analytics'
  children: React.ReactNode;
}

export default function PageGate({ pageKey, children }: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUnlocked(false);
    setPin('');
    setError('');

    const timer = window.setTimeout(() => inputRef.current?.focus(), 250);

    return () => {
      window.clearTimeout(timer);
      setUnlocked(false);
      setPin('');
      setError('');
    };
  }, [pageKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError('');

    try {
      await api.post(`/page-gates/${pageKey}/verify`, {
        pin,
      });

      setUnlocked(true);
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Something went wrong while verifying the PIN.'
        : 'Something went wrong while verifying the PIN.';
      setError(message);
      setPin('');
      inputRef.current?.focus();
    } finally {
      setChecking(false);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/35 backdrop-blur-sm">
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-white shadow-2xl shadow-slate-900/10">
          <div className="border-b border-[#b9d5f5] bg-gradient-to-br from-[#1d4f97] via-[#1568bb] to-[#4f92da] px-8 py-9 text-white">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 shadow-lg shadow-[rgba(21,104,187,0.28)]">
              <Lock className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-100/80">
                Restricted Access
              </p>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Verify page access
              </h1>
              <p className="text-sm leading-6 text-blue-50/90">
                Enter the access PIN to open this page. Once you leave, access will be locked again.
              </p>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
                  Access PIN
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    required
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-[var(--surface-soft)] px-4 py-4 pr-12 text-sm font-mono text-slate-900 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-[var(--ring)]"
                    placeholder="••••••••"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPin(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                  >
                    {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                      Temporary Unlock
                    </p>
                    <p className="text-sm text-slate-600">
                      Access stays active only while you remain on this page.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={checking || !pin}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 text-sm font-bold text-white shadow-lg shadow-[rgba(21,104,187,0.22)] transition-all hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{checking ? 'Verifying...' : 'Unlock Page'}</span>
                {!checking && <ChevronRight className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  );
}
