'use client';

import { Activity, RefreshCcw } from 'lucide-react';
import { MobileAppShell, MobileBadge, MobileCard, MobileMode, useMobilePalette } from './MobileAppShell';

function MonitoringContent({ mode }: { mode: MobileMode }) {
  const palette = useMobilePalette(mode);
  const hosts = [
    { name: 'Core Server', ip: '203.0.113.10', state: 'Healthy' },
    { name: 'Branch Router', ip: '198.51.100.20', state: 'Down' },
    { name: 'Warehouse NVR', ip: '192.0.2.40', state: 'Healthy' },
  ];

  return (
    <>
      <button className="flex w-full items-center justify-between rounded-[20px] px-5 py-5 text-white" style={{ backgroundColor: palette.primary }}>
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-white/70">Realtime Overview</p>
          <p className="mt-2 text-[22px] font-bold">Sync All Hosts</p>
        </div>
        <RefreshCcw className="h-5 w-5" />
      </button>

      <div className="mt-5 space-y-3">
        {hosts.map((host) => (
          <MobileCard key={host.name} mode={mode} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[15px] font-bold" style={{ color: palette.text }}>{host.name}</p>
                <p className="mt-1 text-[13px]" style={{ color: palette.textSoft }}>{host.ip}</p>
              </div>
              <MobileBadge mode={mode} label={host.state} tone={host.state === 'Down' ? 'high' : 'done'} />
            </div>
            <div className="flex items-center gap-2 text-[12px]" style={{ color: palette.textSoft }}>
              <Activity className="h-4 w-4" />
              Last check 2 minutes ago
            </div>
          </MobileCard>
        ))}
      </div>
    </>
  );
}

export function MonitoringMobileScreen() {
  return (
    <MobileAppShell title="Monitoring" subtitle="Track infrastructure status">
      {(mode) => <MonitoringContent mode={mode} />}
    </MobileAppShell>
  );
}
