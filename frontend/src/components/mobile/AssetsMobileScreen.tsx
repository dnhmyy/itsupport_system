'use client';

import { Monitor, Search, Server, Waypoints } from 'lucide-react';
import { MobileAppShell, MobileCard, MobileMode, useMobilePalette } from './MobileAppShell';

function AssetsContent({ mode }: { mode: MobileMode }) {
  const palette = useMobilePalette(mode);
  const categories = [
    { label: 'PC / Laptop', total: 64, icon: Monitor },
    { label: 'Server', total: 12, icon: Server },
    { label: 'Network', total: 18, icon: Waypoints },
    { label: 'Other', total: 7, icon: Search },
  ];

  return (
    <>
      <div className="flex items-center gap-3 rounded-[18px] border px-4 py-3" style={{ backgroundColor: palette.surface, borderColor: palette.border, boxShadow: palette.shadow }}>
        <Search className="h-4 w-4" style={{ color: palette.textSoft }} />
        <span className="text-[14px]" style={{ color: palette.textSoft }}>Search assets</span>
      </div>

      <button className="mt-3 w-full rounded-[18px] px-4 py-4 text-left text-white" style={{ backgroundColor: palette.primary }}>
        <span className="text-[20px] font-bold">Add Asset</span>
      </button>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {categories.map(({ label, total, icon: Icon }) => (
          <MobileCard key={label} mode={mode} className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: palette.surfaceMuted }}>
              <Icon className="h-4 w-4" style={{ color: palette.primary }} />
            </div>
            <p className="text-[14px] font-semibold" style={{ color: palette.text }}>{label}</p>
            <p className="text-[26px] font-bold leading-none" style={{ color: palette.text }}>{total}</p>
            <p className="text-[12px]" style={{ color: palette.textSoft }}>total units</p>
          </MobileCard>
        ))}
      </div>
    </>
  );
}

export function AssetsMobileScreen() {
  return (
    <MobileAppShell title="Assets" subtitle="Track inventory">
      {(mode) => <AssetsContent mode={mode} />}
    </MobileAppShell>
  );
}
