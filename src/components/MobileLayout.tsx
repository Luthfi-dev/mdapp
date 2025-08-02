
'use client';

import BottomNavBar from './BottomNavBar';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // This is the single source of truth for showing/hiding the nav bar.
  // A path is considered to require a hidden nav if it *starts with* one of these routes.
  const noNavPaths = ['/messages', '/login', '/account', '/surat', '/surat-generator', '/admin'];
  const showBottomNav = !noNavPaths.some(path => pathname.startsWith(path));

  return (
    <div className="flex flex-col flex-1 h-full">
      <main className={cn("flex-1", showBottomNav ? "pb-16" : "")}>{children}</main>
      {showBottomNav && <BottomNavBar />}
    </div>
  );
}
