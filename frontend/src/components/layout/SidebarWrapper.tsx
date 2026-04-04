'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuthStore } from '@/store/auth';

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  
  const isLoginPage = pathname === '/login';
  const showLayout = isAuthenticated && !isLoginPage;

  if (!showLayout) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,180,234,0.22)_0%,_transparent_28%),linear-gradient(180deg,#f8fbff_0%,#edf4ff_42%,#e5effd_100%)]">
      <Sidebar />
      <div className="flex-1 lg:ml-[18rem]">
        <Navbar />
        <main className="px-8 pb-8 pt-6 xl:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
