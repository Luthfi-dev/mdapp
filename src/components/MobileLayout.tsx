
'use client';

import BottomNavBar from './BottomNavBar';

export function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1 h-full">
      <main className="flex-1 pb-20">{children}</main>
      <BottomNavBar />
    </div>
  );
}
