'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Monitor,
  Database,
  Ticket,
  BookOpenText,
  History,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import logoApp from '@/app/icon.png';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/', group: 'Workspace' },
  { icon: Ticket, label: 'Tickets', href: '/tickets', group: 'Workspace' },
  { icon: BookOpenText, label: 'Guides', href: '/knowledge-base', group: 'Workspace' },
  { icon: Monitor, label: 'Monitoring', href: '/monitoring', group: 'Infrastructure' },
  { icon: Database, label: 'Assets', href: '/assets', group: 'Infrastructure' },
  { icon: History, label: 'Audit Logs', href: '/logs', group: 'Security' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();

  const menuGroups = ['Workspace', 'Infrastructure', 'Security'] as const;

  const SidebarContent = (
    <div className="flex h-full flex-col rounded-[32px] border border-[var(--border)] bg-white/94 p-4 shadow-[0_16px_40px_rgba(17,38,69,0.08)] backdrop-blur-xl">
      <div className="mb-7 flex items-center justify-between">
        <div className="flex items-center gap-3 text-primary">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-2">
            <Image
              src={logoApp}
              alt="IT Support System"
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div>
            <span className="text-lg font-semibold tracking-tight text-[var(--foreground)]">OpsCore</span>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.24em] text-[#7f90a6]">IT Support System</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[#7f90a6] hover:bg-[var(--surface-soft)] lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto pr-1 scrollbar-none">
        {menuGroups.map((group) => (
          <div key={group} className="space-y-1.5">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8a9bae]">
              {group}
            </p>
            {menuItems
              .filter((item) => item.group === group)
              .map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-[var(--primary-soft)] text-primary'
                        : 'text-[#586d84] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]'
                    )}
                  >
                    <item.icon className={cn('h-4 w-4', isActive ? 'text-primary' : 'text-[#93a4b8]')} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>

      <div className="mt-6 space-y-3">
        <Link
          href="/settings"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-[#586d84] transition-all hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
        >
          <Settings className="h-4 w-4 text-[#93a4b8]" />
          <span>Settings</span>
        </Link>

        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-soft)] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#eef5ff_0%,#d4e4fb_100%)] text-primary shadow-inner">
              <ProfileAvatar iconId={user?.profile_icon} name={user?.name} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--foreground)]">{user?.name || 'Guest User'}</p>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8496aa]">
                {user?.role || 'visitor'}
              </p>
            </div>
            <button
              onClick={() => logout()}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8496aa] transition-all hover:bg-rose-50 hover:text-rose-600"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[18rem] p-5 lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-[rgba(15,31,58,0.36)] backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-[60] h-screen w-[20rem] p-4 lg:hidden"
            >
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
