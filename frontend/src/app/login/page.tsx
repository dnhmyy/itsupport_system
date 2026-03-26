'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Lock, Mail, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/login', {
        email,
        password,
        device_name: 'browser'
      });
      setAuth(data.user);
      router.push('/');
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || err.response?.data?.error || 'Invalid credentials. Please try again.'
        : 'Invalid credentials. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#dff7ea_0%,#ecfdf3_100%)] shadow-lg shadow-emerald-900/10">
            <div className="grid grid-cols-2 gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to access the IT Support workspace
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <div className="group relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition-colors group-focus-within:text-emerald-600">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 outline-none transition-all focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/5"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="group relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition-colors group-focus-within:text-emerald-600">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 outline-none transition-all focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/5"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition-all hover:opacity-90 focus:ring-4 focus:ring-emerald-600/10 active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          © 2026 IT Support System. All rights reserved.
        </p>
      </div>
    </div>
  );
}
