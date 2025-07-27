'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, User, Bell, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/learn", label: "Belajar", icon: BookOpen },
  { href: "/login", label: "Login", icon: BrainCircuit },
  { href: "/notifications", label: "Pengumuman", icon: Bell },
  { href: "/account", label: "Akun", icon: User },
];

const BottomNavBar = () => {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-transparent z-50">
      <div className="h-full px-2 custom-nav">
        <div className="flex justify-around items-center h-full">
          {navItems.map(({ href, label, icon: Icon }) => {
             const isActive = (pathname === '/' && href === '/') || (pathname.startsWith(href) && href !== '/');
             const isLogin = label === "Login";

            return (
              <div key={label} className="relative flex flex-col items-center justify-center w-16">
                 {isLogin && (
                    <div className="absolute -top-10">
                        <Link href={href}>
                            <div className={cn(
                                "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 bg-primary shadow-lg",
                            )}>
                               <Icon className={cn("h-10 w-10 text-primary-foreground")} />
                            </div>
                        </Link>
                    </div>
                )}
                {!isLogin && (
                     <Link href={href} className="flex flex-col items-center gap-1 text-center w-full">
                      <Icon className={cn("h-6 w-6 transition-colors", isActive ? 'text-primary' : 'text-muted-foreground')} />
                      <span className={cn("text-xs font-medium transition-colors", isActive ? 'text-primary' : 'text-muted-foreground')}>
                        {label}
                      </span>
                    </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNavBar;
