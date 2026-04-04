'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, FileText, Grid2x2, MonitorCog, Moon, Package2, Settings, SunMedium } from 'lucide-react';
import { ReactNode, useMemo, useState } from 'react';

export type MobileMode = 'light' | 'dark';

type ShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode | ((mode: MobileMode) => ReactNode);
};

export function useMobilePalette(mode: MobileMode) {
  return useMemo(
    () => ({
      background: mode === 'dark' ? '#0f172a' : '#f5f6f8',
      surface: mode === 'dark' ? '#1f2937' : '#ffffff',
      surfaceMuted: mode === 'dark' ? '#111827' : '#f8fafc',
      border: mode === 'dark' ? '#374151' : '#e5e7eb',
      text: mode === 'dark' ? '#f9fafb' : '#0f172a',
      textSoft: mode === 'dark' ? '#9ca3af' : '#6b7280',
      primary: mode === 'dark' ? '#2b4a6f' : '#1e3a5f',
      primarySoft: mode === 'dark' ? '#22344b' : '#eff6ff',
      primaryText: '#ffffff',
      shadow: mode === 'dark' ? '0 10px 24px rgba(2,6,23,0.18)' : '0 10px 24px rgba(15,23,42,0.06)',
      openBg: mode === 'dark' ? 'rgba(96,165,250,0.18)' : '#eff6ff',
      openBorder: mode === 'dark' ? 'rgba(96,165,250,0.28)' : '#bfdbfe',
      openText: mode === 'dark' ? '#93c5fd' : '#2563eb',
      doneBg: mode === 'dark' ? 'rgba(74,222,128,0.18)' : '#f0fdf4',
      doneBorder: mode === 'dark' ? 'rgba(74,222,128,0.28)' : '#bbf7d0',
      doneText: mode === 'dark' ? '#86efac' : '#16a34a',
      highBg: mode === 'dark' ? 'rgba(248,113,113,0.18)' : '#fef2f2',
      highBorder: mode === 'dark' ? 'rgba(248,113,113,0.28)' : '#fecaca',
      highText: mode === 'dark' ? '#fca5a5' : '#dc2626',
      mediumBg: mode === 'dark' ? 'rgba(251,191,36,0.18)' : '#fff7ed',
      mediumBorder: mode === 'dark' ? 'rgba(251,191,36,0.28)' : '#fed7aa',
      mediumText: mode === 'dark' ? '#fcd34d' : '#ea580c',
      lowBg: mode === 'dark' ? 'rgba(74,222,128,0.18)' : '#f0fdf4',
      lowBorder: mode === 'dark' ? 'rgba(74,222,128,0.28)' : '#bbf7d0',
      lowText: mode === 'dark' ? '#86efac' : '#16a34a',
    }),
    [mode]
  );
}

export function MobileCard({
  mode,
  children,
  className = '',
}: {
  mode: MobileMode;
  children: ReactNode;
  className?: string;
}) {
  const palette = useMobilePalette(mode);
  return (
    <div
      className={`rounded-[20px] border p-4 ${className}`}
      style={{
        backgroundColor: palette.surface,
        borderColor: palette.border,
        boxShadow: palette.shadow,
      }}
    >
      {children}
    </div>
  );
}

export function MobileBadge({
  mode,
  label,
  tone,
}: {
  mode: MobileMode;
  label: string;
  tone: 'open' | 'done' | 'high' | 'medium' | 'low';
}) {
  const palette = useMobilePalette(mode);
  const colors =
    tone === 'open'
      ? { bg: palette.openBg, border: palette.openBorder, text: palette.openText }
      : tone === 'done'
        ? { bg: palette.doneBg, border: palette.doneBorder, text: palette.doneText }
        : tone === 'high'
          ? { bg: palette.highBg, border: palette.highBorder, text: palette.highText }
          : tone === 'medium'
            ? { bg: palette.mediumBg, border: palette.mediumBorder, text: palette.mediumText }
            : { bg: palette.lowBg, border: palette.lowBorder, text: palette.lowText };

  return (
    <span
      className="inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold"
      style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}
    >
      {label}
    </span>
  );
}

export function MobileTicketCard({
  mode,
  title,
  description,
  status,
  priority,
  progress,
  date,
  user,
}: {
  mode: MobileMode;
  title: string;
  description: string;
  status: 'Open' | 'Done';
  priority: 'High' | 'Medium' | 'Low';
  progress: number;
  date: string;
  user: string;
}) {
  const palette = useMobilePalette(mode);

  return (
    <MobileCard mode={mode}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-bold" style={{ color: palette.text }}>
            {title}
          </h3>
          <p className="mt-1 line-clamp-2 text-[13px] leading-5" style={{ color: palette.textSoft }}>
            {description}
          </p>
        </div>
        <FileText className="h-4 w-4 shrink-0" style={{ color: palette.textSoft }} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <MobileBadge mode={mode} label={status} tone={status === 'Done' ? 'done' : 'open'} />
        <MobileBadge mode={mode} label={priority} tone={priority.toLowerCase() as 'high' | 'medium' | 'low'} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[12px] font-semibold" style={{ color: palette.textSoft }}>
          Progress
        </span>
        <span className="text-[12px] font-semibold" style={{ color: palette.text }}>
          {progress}%
        </span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: palette.border }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${progress}%`, backgroundColor: palette.primary }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-[12px]" style={{ color: palette.textSoft }}>
        <span>{date}</span>
        <span>{user}</span>
      </div>
    </MobileCard>
  );
}

export function MobileAppShell({ title, subtitle, children }: ShellProps) {
  const pathname = usePathname();
  const [mode, setMode] = useState<MobileMode>('light');
  const palette = useMobilePalette(mode);
  const items = [
    { href: '/mobile', label: 'Dashboard', icon: Grid2x2 },
    { href: '/mobile/assets', label: 'Assets', icon: Package2 },
    { href: '/mobile/tickets', label: 'Ticketboard', icon: FileText },
    { href: '/mobile/monitoring', label: 'Monitoring', icon: MonitorCog },
    { href: '/mobile/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen px-6 py-10" style={{ backgroundColor: mode === 'dark' ? '#0b1120' : '#eef1f4' }}>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8">
        <div className="flex items-center gap-3 rounded-full border bg-white px-3 py-2 shadow-sm" style={{ borderColor: '#dbe1e8' }}>
          <button
            type="button"
            onClick={() => setMode('light')}
            className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${mode === 'light' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
          >
            <SunMedium className="h-4 w-4" />
            Light
          </button>
          <button
            type="button"
            onClick={() => setMode('dark')}
            className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${mode === 'dark' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
          >
            <Moon className="h-4 w-4" />
            Dark
          </button>
        </div>

        <div className="w-[390px] rounded-[38px] border p-3" style={{ backgroundColor: '#101215', borderColor: '#1f2937', boxShadow: '0 24px 80px rgba(15,23,42,0.18)' }}>
          <div className="rounded-[30px] px-4 pb-4 pt-5" style={{ backgroundColor: palette.background }}>
            <div className="mb-5 flex items-center justify-between">
              <div
                className="inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em]"
                style={{ backgroundColor: palette.surface, borderColor: palette.border, color: palette.text }}
              >
                Mobile Workspace
              </div>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-2xl border"
                style={{ backgroundColor: palette.surface, borderColor: palette.border, color: palette.text }}
              >
                <Bell className="h-4 w-4" />
              </button>
            </div>

            <div>
              <h1 className="text-[34px] font-bold leading-none" style={{ color: palette.text }}>
                {title}
              </h1>
              <p className="mt-2 text-[14px]" style={{ color: palette.textSoft }}>
                {subtitle}
              </p>
            </div>

            <div className="mt-5">{typeof children === 'function' ? children(mode) : children}</div>

            <div
              className="mt-4 grid grid-cols-5 rounded-[20px] border p-2"
              style={{ backgroundColor: palette.surface, borderColor: palette.border, boxShadow: palette.shadow }}
            >
              {items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link key={href} href={href} className="flex flex-col items-center gap-1 rounded-2xl px-1 py-2">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl border"
                      style={{
                        backgroundColor: active ? palette.primarySoft : 'transparent',
                        borderColor: active ? palette.border : 'transparent',
                        color: active ? palette.primary : palette.textSoft,
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-medium" style={{ color: active ? palette.text : palette.textSoft }}>
                      {label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
