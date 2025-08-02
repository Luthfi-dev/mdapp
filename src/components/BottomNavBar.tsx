
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, User, MessageSquare, Notebook } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/explore", label: "Jelajah", icon: Compass },
  { href: "/notebook", label: "Catatan", icon: Notebook },
  { href: "/messages", label: "Pesan", icon: MessageSquare },
  { href: "/account", label: "Akun", icon: User },
];

const BottomNavBar = () => {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-card z-50 shadow-[0_-8px_32px_0_rgba(0,0,0,0.05)] border-t rounded-t-2xl custom-nav">
      <div className="flex justify-around items-center h-full">
        {navItems.map(({ href, label, icon: Icon }) => {
          // A more robust check for active state that handles nested routes
          const isActive = (href === "/" && pathname === href) || (href !== "/" && pathname.startsWith(href));

          return (
            <Link key={label} href={href} className="flex flex-col items-center justify-center w-full h-full transition-colors duration-300">
              <div className={cn(
                "flex flex-col items-center gap-1 text-center w-full transition-all duration-300 relative pt-1", 
                isActive ? 'text-primary scale-110' : 'text-muted-foreground hover:text-foreground'
              )}>
                <Icon className="h-6 w-6" />
                <span className={cn("text-xs transition-all", isActive ? 'font-bold' : 'font-medium')}>
                  {label}
                </span>
                {isActive && (
                  <div className="absolute -bottom-2 w-1.5 h-1.5 bg-primary rounded-full" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavBar;
