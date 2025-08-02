
'use client';

import BottomNavBar from './BottomNavBar';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Define routes where the bottom navigation should be hidden.
  // This approach is more robust as it checks if the pathname *starts with* a given route.
  const noNavPaths = ['/messages', '/login', '/admin', '/surat/', '/surat-generator'];
  
  // Determine if the current path matches any of the paths where the nav should be hidden.
  const showBottomNav = !noNavPaths.some(path => {
    if (path.endsWith('/')) {
       return pathname.startsWith(path);
    }
    return pathname === path;
  });

  // A special check for the account root page, which should not show the nav bar.
  // We check for exact match to avoid hiding it on sub-pages like /account/profile.
  const isAccountRoot = pathname === '/account';

  return (
    <div className="flex flex-col flex-1 h-full">
      <main className={cn("flex-1", showBottomNav && !isAccountRoot ? "pb-20" : "")}>{children}</main>
      {showBottomNav && !isAccountRoot && <BottomNavBar />}
    </div>
  );
}
