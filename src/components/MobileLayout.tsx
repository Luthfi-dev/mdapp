
'use client';

import BottomNavBar from './BottomNavBar';
import { usePathname } from 'next/navigation';

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Exclude BottomNavBar for specific pages
  const noNavPages = ['/messages', '/login', '/account'];
  const showBottomNav = !noNavPages.includes(pathname) && !pathname.startsWith('/admin') && !pathname.startsWith('/surat/');

  return (
    <div className="flex flex-col flex-1 h-full">
      <main className={cn("flex-1", showBottomNav ? "pb-20" : "")}>{children}</main>
      {showBottomNav && <BottomNavBar />}
    </div>
  );
}
