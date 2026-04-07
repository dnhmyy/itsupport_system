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
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(120,164,225,0.18)_0%,_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(29,95,191,0.08)_0%,_transparent_26%),linear-gradient(180deg,#f8fbfd_0%,#f3f7fb_42%,#eef3f8_100%)]">
      <Sidebar />
      <div className="flex-1 lg:ml-[18rem]">
        <Navbar />
        <main className="px-5 pb-8 pt-6 sm:px-6 lg:px-8 xl:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
