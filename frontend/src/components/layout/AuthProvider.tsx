'use client';

import { useAuthStore } from '@/store/auth';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import logoApp from '@/app/icon.png';

const ROLE_ACCESS_MAP: Record<string, string[]> = {
  '/monitoring': ['admin'],
  '/assets': ['admin', 'technician'],
  '/logs': ['admin'],
};

export default function AuthProvider({ children, hasAuthCookie }: { children: React.ReactNode; hasAuthCookie: boolean }) {
  const { checkAuth, clearAuth, isAuthenticated, user, authChecked } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const initializedRef = useRef(false);
  const needsLoginRedirect = authChecked && !isAuthenticated && pathname !== '/login';
  const needsDashboardRedirect = authChecked && isAuthenticated && pathname === '/login';
  const isRedirecting = needsLoginRedirect || needsDashboardRedirect;

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    if (!hasAuthCookie) {
      clearAuth();
      return;
    }

    void checkAuth();
  }, [checkAuth, clearAuth, hasAuthCookie]);

  useEffect(() => {
    if (!authChecked) {
      return;
    }

    if (!isAuthenticated && pathname !== '/login') {
      router.replace('/login');
      return;
    }

    if (isAuthenticated && pathname === '/login') {
      router.replace('/');
      return;
    }

    const allowedRoles = Object.entries(ROLE_ACCESS_MAP).find(([prefix]) => pathname.startsWith(prefix))?.[1];

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.replace('/');
    }
  }, [authChecked, isAuthenticated, pathname, router, user]);

  if (!authChecked || isRedirecting) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(112,175,238,0.22)_0%,_transparent_35%),linear-gradient(180deg,#f8fbff_0%,#edf4ff_52%,#e5effd_100%)] px-4">
        <div className="w-full max-w-xs rounded-[28px] border border-[var(--border)] bg-white/75 p-3 shadow-[0_24px_60px_rgba(29,79,151,0.14)] backdrop-blur-xl">
          <div className="rounded-[22px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(244,248,255,0.98)_100%)] px-6 py-7">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-[var(--border)] bg-white p-3 shadow-[0_10px_24px_rgba(29,79,151,0.10)]">
                <Image
                  src={logoApp}
                  alt="OpsCore IT Support System"
                  className="h-full w-full object-contain"
                  priority
                />
              </div>

              <p className="mt-5 text-base font-semibold text-slate-950">Menyiapkan workspace</p>
              <p className="mt-1 text-sm leading-6 text-[#5f7da8]">Sesi Anda sedang diperiksa.</p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-2 text-[#4d6486] shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">Loading</span>
              </div>
              <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-[#d9e7f8]">
                <div className="h-full w-2/5 rounded-full bg-[linear-gradient(90deg,#4f92da_0%,#1568bb_100%)] animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
