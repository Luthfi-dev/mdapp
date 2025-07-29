
'use client';

import BottomNavBar from './BottomNavBar';
import { usePathname } from 'next/navigation';

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Do not render bottom nav bar on messages page
  const showBottomNav = pathname !== '/messages';

  return (
    <div className="flex flex-col flex-1 h-full">
      <main className="flex-1 pb-20">{children}</main>
      {showBottomNav && <BottomNavBar />}
    </div>
  );
}
