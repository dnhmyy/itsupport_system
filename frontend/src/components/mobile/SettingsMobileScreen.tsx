'use client';

import { Lock, UserCircle2 } from 'lucide-react';
import { MobileAppShell, MobileCard, MobileMode, useMobilePalette } from './MobileAppShell';

function SettingsContent({ mode }: { mode: MobileMode }) {
  const palette = useMobilePalette(mode);

  return (
    <div className="space-y-3">
      <MobileCard mode={mode} className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: palette.surfaceMuted }}>
            <UserCircle2 className="h-5 w-5" style={{ color: palette.primary }} />
          </div>
          <div>
            <p className="text-[16px] font-bold" style={{ color: palette.text }}>Current account</p>
            <p className="text-[13px]" style={{ color: palette.textSoft }}>Manage profile data</p>
          </div>
        </div>
        <div className="space-y-2 text-[14px]" style={{ color: palette.textSoft }}>
          <p>Name: <span style={{ color: palette.text }}>Mobile Admin</span></p>
          <p>Email: <span style={{ color: palette.text }}>admin@company.com</span></p>
          <p>Role: <span style={{ color: palette.text }}>Administrator</span></p>
        </div>
      </MobileCard>

      <MobileCard mode={mode} className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: palette.surfaceMuted }}>
            <Lock className="h-5 w-5" style={{ color: palette.primary }} />
          </div>
          <div>
            <p className="text-[16px] font-bold" style={{ color: palette.text }}>Change password</p>
            <p className="text-[13px]" style={{ color: palette.textSoft }}>Keep your access secure</p>
          </div>
        </div>
        <button className="w-full rounded-[18px] px-4 py-4 text-left text-white" style={{ backgroundColor: palette.primary }}>
          Save New Password
        </button>
      </MobileCard>
    </div>
  );
}

export function SettingsMobileScreen() {
  return (
    <MobileAppShell title="Settings" subtitle="Manage account">
      {(mode) => <SettingsContent mode={mode} />}
    </MobileAppShell>
  );
}
