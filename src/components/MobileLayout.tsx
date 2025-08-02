
'use client';

import BottomNavBar from './BottomNavBar';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Exclude BottomNavBar for specific pages or page groups
  const noNavPaths = ['/messages', '/login', '/account', '/surat', '/surat-generator'];
  const showBottomNav = !noNavPaths.some(path => pathname.startsWith(path)) && !pathname.startsWith('/admin');

  return (
    <div className="flex flex-col flex-1 h-full">
      <main className={cn("flex-1", showBottomNav ? "pb-20" : "")}>{children}</main>
      {showBottomNav && <BottomNavBar />}
    </div>
  );
}
