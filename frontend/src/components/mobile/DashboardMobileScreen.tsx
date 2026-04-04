'use client';

import { Activity, AlertTriangle, Archive, Boxes, Server } from 'lucide-react';
import { MobileAppShell, MobileBadge, MobileCard, MobileMode, useMobilePalette } from './MobileAppShell';

function DashboardContent({ mode }: { mode: MobileMode }) {
  const palette = useMobilePalette(mode);
  const cards = [
    { label: 'Monitored Nodes', value: 24, helper: '20 active', icon: Activity },
    { label: 'Asset Inventory', value: 168, helper: '126 available', icon: Archive },
    { label: 'Tickets', value: 12, helper: '6 active', icon: Boxes },
    { label: 'Assets at Risk', value: 8, helper: '3 broken', icon: AlertTriangle },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {cards.map(({ label, value, helper, icon: Icon }) => (
          <MobileCard key={label} mode={mode} className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: palette.surfaceMuted }}>
              <Icon className="h-4 w-4" style={{ color: palette.primary }} />
            </div>
            <p className="text-[12px] leading-4" style={{ color: palette.textSoft }}>{label}</p>
            <p className="text-[26px] font-bold leading-none" style={{ color: palette.text }}>{value}</p>
            <p className="text-[12px]" style={{ color: palette.textSoft }}>{helper}</p>
          </MobileCard>
        ))}
      </div>

      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[18px] font-bold" style={{ color: palette.text }}>Infrastructure Monitoring</h2>
          <span className="text-[12px]" style={{ color: palette.textSoft }}>Live categories</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Server', total: 4, state: 'Healthy' },
            { label: 'Router', total: 3, state: 'Down' },
            { label: 'NVR', total: 2, state: 'Healthy' },
            { label: 'Docker', total: 6, state: 'Healthy' },
          ].map((item) => (
            <MobileCard key={item.label} mode={mode} className="space-y-2">
              <div className="flex items-center justify-between">
                <Server className="h-4 w-4" style={{ color: palette.primary }} />
                <MobileBadge mode={mode} label={item.state} tone={item.state === 'Down' ? 'high' : 'done'} />
              </div>
              <p className="text-[14px] font-semibold" style={{ color: palette.text }}>{item.label}</p>
              <p className="text-[24px] font-bold leading-none" style={{ color: palette.text }}>{item.total}</p>
            </MobileCard>
          ))}
        </div>
      </div>
    </>
  );
}

export function DashboardMobileScreen() {
  return (
    <MobileAppShell title="Dashboard" subtitle="Operational summary">
      {(mode) => <DashboardContent mode={mode} />}
    </MobileAppShell>
  );
}
