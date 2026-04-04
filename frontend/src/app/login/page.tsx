'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Fingerprint,
  Loader2,
  Lock,
  Mail,
} from 'lucide-react';
import axios from 'axios';
import logoApp from '../icon.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        device_name: 'browser',
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
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#edf4ff_52%,#e5effd_100%)] text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(112,175,238,0.24),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(21,104,187,0.18),_transparent_30%)]" />
      <div className="absolute left-[-8%] top-20 h-64 w-64 rounded-full bg-[rgba(255,255,255,0.52)] blur-3xl" />
      <div className="absolute right-[-4%] top-1/4 h-80 w-80 rounded-full bg-[rgba(124,180,234,0.20)] blur-3xl" />
      <div className="absolute bottom-[-8%] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[rgba(29,79,151,0.14)] blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="rounded-[34px] border border-[var(--border)] bg-white/72 p-2.5 shadow-[0_26px_72px_rgba(29,79,151,0.14)] backdrop-blur-2xl">
            <div className="rounded-[28px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(244,248,255,0.98)_100%)] p-6 sm:p-7">
              <div className="mx-auto flex w-fit items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-[var(--border)] bg-white p-2 shadow-[0_12px_24px_rgba(29,79,151,0.10)]">
                  <Image
                    src={logoApp}
                    alt="OpsCore IT Support System"
                    className="h-full w-full object-contain"
                    priority
                  />
                </div>
                <div>
                  <p className="text-[1.7rem] font-black tracking-[-0.05em] text-slate-950">OpsCore</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#5f7da8]">
                    IT Support System
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#4d6486] shadow-sm">
                  <Fingerprint className="h-3.5 w-3.5 text-primary" />
                  Secure Sign In
                </div>
              </div>

              <div className="mt-6 text-center">
                <h1 className="text-[2rem] font-black tracking-[-0.07em] text-slate-950 sm:text-[2.35rem]">
                  Welcome back
                </h1>
                <p className="mt-2 text-[13px] leading-6 text-[#5f7da8]">
                  Masuk dengan akun internal Anda.
                </p>
              </div>

              <form className="mt-8 space-y-4" onSubmit={handleLogin}>
                {error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                    {error}
                  </div>
                ) : null}

                <label className="block">
                  <span className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.16em] text-[#33517c]">
                    Email
                  </span>
                  <span className="group flex items-center gap-3 rounded-[20px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3.5 transition-all duration-300 focus-within:-translate-y-0.5 focus-within:border-[var(--primary)] focus-within:bg-white focus-within:shadow-[0_12px_30px_rgba(29,79,151,0.12)]">
                    <Mail className="h-4.5 w-4.5 text-[#7d97ba] group-focus-within:text-primary" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent text-[15px] text-[var(--foreground)] outline-none placeholder:text-[#8ca3c2]"
                      placeholder="Masukan Email"
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.16em] text-[#33517c]">
                    Password
                  </span>
                  <span className="group flex items-center gap-3 rounded-[20px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3.5 transition-all duration-300 focus-within:-translate-y-0.5 focus-within:border-[var(--primary)] focus-within:bg-white focus-within:shadow-[0_12px_30px_rgba(29,79,151,0.12)]">
                    <Lock className="h-4.5 w-4.5 text-[#7d97ba] group-focus-within:text-primary" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent text-[15px] text-[var(--foreground)] outline-none placeholder:text-[#8ca3c2]"
                      placeholder="Masukkan Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="text-[#7d97ba] transition-colors hover:text-primary"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-[linear-gradient(135deg,#1d4f97_0%,#1568bb_55%,#4f92da_100%)] px-5 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(21,104,187,0.28)] active:translate-y-0 active:scale-[0.99] disabled:opacity-70"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Masuk'}
                  {!loading ? <ArrowRight className="h-4 w-4" /> : null}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-4 text-xs text-[#5f7da8]">
                <span>Login</span>
                <span>© 2026 OpsCore | IT Support System</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
