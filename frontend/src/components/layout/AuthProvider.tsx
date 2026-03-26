'use client';

import { useAuthStore } from '@/store/auth';
import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const ROLE_ACCESS_MAP: Record<string, string[]> = {
  '/monitoring': ['admin'],
  '/assets': ['admin', 'technician'],
  '/logs': ['admin'],
};

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth, isAuthenticated, user, authChecked } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    void checkAuth();
  }, [checkAuth]);

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

  if (!authChecked) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f7faf9] px-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] border border-emerald-100 bg-white shadow-sm">
              <div className="grid grid-cols-2 gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-600/80">
                IT Support
              </p>
              <h2 className="mt-1 text-[1.35rem] font-semibold tracking-tight text-slate-900">
                Loading your workspace
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Checking your session and preparing the pages you can access.
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-full bg-slate-200/80">
            <div className="h-1.5 w-2/5 animate-pulse rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
