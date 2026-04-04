'use client';

import { ChevronRight } from 'lucide-react';
import { MobileAppShell, MobileMode, MobileTicketCard, useMobilePalette } from './MobileAppShell';

const tickets = [
  {
    id: 1,
    title: 'Install Router',
    description: 'New branch installation request',
    status: 'Open' as const,
    priority: 'High' as const,
    progress: 20,
    date: '12 Mar 2026',
    user: 'Rizky',
  },
  {
    id: 2,
    title: 'Printer Label Error',
    description: 'Barcode output inconsistent on warehouse printer',
    status: 'Open' as const,
    priority: 'Medium' as const,
    progress: 55,
    date: '11 Mar 2026',
    user: 'Dina',
  },
  {
    id: 3,
    title: 'Laptop Handover',
    description: 'Device preparation for new staff onboarding',
    status: 'Done' as const,
    priority: 'Low' as const,
    progress: 85,
    date: '10 Mar 2026',
    user: 'Arman',
  },
];

function TicketsContent({ mode }: { mode: MobileMode }) {
  const palette = useMobilePalette(mode);

  return (
    <>
      <div
        className="relative overflow-hidden rounded-[20px] border px-5 py-5"
        style={{
          backgroundColor: palette.primary,
          borderColor: 'rgba(255,255,255,0.06)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-white/70">Workspace Action</p>
            <h2 className="mt-2 text-[22px] font-bold text-white">Create Ticket</h2>
            <p className="mt-1 text-[13px] text-white/80">2 open requests • 4 resolved</p>
          </div>
          <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {tickets.map((ticket) => (
          <MobileTicketCard key={ticket.id} mode={mode} {...ticket} />
        ))}
      </div>
    </>
  );
}

export function TicketsMobileScreen() {
  return (
    <MobileAppShell title="Tickets" subtitle="Manage requests">
      {(mode) => <TicketsContent mode={mode} />}
    </MobileAppShell>
  );
}
