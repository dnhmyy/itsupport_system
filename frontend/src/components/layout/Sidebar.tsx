'use client';

import Link from 'next/link';
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

  const menuGroups = ['Workspace', 'Infrastructure', 'Security'] as const;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[18rem] p-5">
      <div className="flex h-full flex-col rounded-[30px] border border-white/70 bg-white/85 p-4 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 text-primary">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#dff7ea_0%,#ecfdf3_100%)] text-primary shadow-inner">
              <div className="grid grid-cols-2 gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
              </div>
            </div>
            <div>
              <span className="text-lg font-semibold tracking-tight">IT Support</span>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.24em] text-slate-400">Operations Hub</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-6">
          {menuGroups.map((group) => (
            <div key={group} className="space-y-1.5">
              <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
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
                      className={cn(
                        'flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-[#e7f5ee] text-primary shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      )}
                    >
                      <item.icon className={cn('h-4 w-4', isActive ? 'text-primary' : 'text-slate-400')} />
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
            className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
          >
            <Settings className="h-4 w-4 text-slate-400" />
            <span>Settings</span>
          </Link>

          <div className="rounded-[22px] border border-slate-100 bg-[#f8fbfa] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#dff7ea_0%,#ecfdf3_100%)] text-sm font-black uppercase tracking-[0.12em] text-primary">
                {(user?.name || 'GU')
                  .split(' ')
                  .slice(0, 2)
                  .map((part) => part[0] || '')
                  .join('')}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{user?.name || 'Guest User'}</p>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  {user?.role || 'visitor'}
                </p>
              </div>
              <button
                onClick={() => logout()}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
