
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronRight, Gem, LogOut, User, Edit, Shield, Bell, Users } from "lucide-react";
import { useRouter } from 'next/navigation';
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Placeholder data - in a real app, this would come from a session/context
const user = {
    name: 'Sana Afzal',
    email: 'sana.afzal22@gmail.com',
    avatar: 'https://placehold.co/128x128.png',
    initials: 'SA'
};

const menuItems = [
    {
        label: "Edit Profil",
        icon: Edit,
        href: "/account/edit-profile"
    },
    {
        label: "Keamanan",
        icon: Shield,
        href: "/account/security"
    },
     {
        label: "Notifikasi",
        icon: Bell,
        href: "/account/notifications"
    },
    {
        label: "Kelola Langganan",
        icon: Gem,
        href: "/pricing"
    },
    {
        label: "Undang Teman",
        icon: Users,
        href: "/account/invite"
    }
];

export default function ProfilePage() {
    const router = useRouter();

    const handleLogout = () => {
        // TODO: Implement actual logout logic (clear session/token)
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-secondary/30">
            <div className="container mx-auto max-w-2xl px-4 py-8 pb-24">
                <div className="flex flex-col items-center pt-8">
                    <Avatar className="w-32 h-32 text-5xl mb-4 border-4 border-background shadow-lg">
                        <AvatarImage src={user.avatar} data-ai-hint="profile picture" />
                        <AvatarFallback>{user.initials}</AvatarFallback>
                    </Avatar>
                    <h1 className="text-3xl font-bold text-foreground">{user.name}</h1>
                    <Badge variant="secondary" className="mt-2 text-muted-foreground bg-secondary/80 border border-border shadow-inner px-4 py-1.5">
                        {user.email}
                    </Badge>
                </div>

                <div className="mt-12 bg-card rounded-2xl shadow-sm p-2">
                    <div className="space-y-1">
                       {menuItems.map((item, index) => (
                            <button key={index} onClick={() => router.push(item.href)} className="w-full text-left p-4 rounded-lg hover:bg-secondary flex items-center justify-between transition-colors">
                                <div className="flex items-center gap-4">
                                    <item.icon className="w-6 h-6 text-muted-foreground" />
                                    <span className="font-semibold text-base text-foreground">{item.label}</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            </button>
                       ))}
                    </div>

                    <Separator className="my-2" />
                    
                    <button onClick={handleLogout} className="w-full text-left p-4 rounded-lg hover:bg-secondary flex items-center justify-between transition-colors text-destructive">
                        <div className="flex items-center gap-4">
                            <LogOut className="w-6 h-6" />
                            <span className="font-semibold text-base">Keluar</span>
                        </div>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
