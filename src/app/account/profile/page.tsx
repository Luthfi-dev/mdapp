
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Gem, LogOut, User, Edit } from "lucide-react";
import { useRouter } from 'next/navigation';

// Placeholder data - in a real app, this would come from a session/context
const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://placehold.co/100x100.png',
    initials: 'JD'
};

const menuItems = [
    {
        label: "Edit Profil",
        icon: Edit,
        href: "/account/edit"
    },
    {
        label: "Kelola Langganan",
        icon: Gem,
        href: "/pricing"
    }
];

export default function ProfilePage() {
    const router = useRouter();

    const handleLogout = () => {
        // TODO: Implement actual logout logic (clear session/token)
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-secondary/40">
            <div className="container mx-auto px-4 py-8 pb-24">
                <Card className="max-w-2xl mx-auto shadow-lg rounded-2xl">
                    <CardHeader className="text-center items-center pt-8">
                        <Avatar className="w-24 h-24 text-4xl mb-4 border-4 border-primary/20">
                            <AvatarImage src={user.avatar} data-ai-hint="profile picture" />
                            <AvatarFallback>{user.initials}</AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-3xl font-bold">{user.name}</CardTitle>
                        <CardDescription className="text-lg text-muted-foreground">{user.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                           {menuItems.map((item, index) => (
                                <button key={index} onClick={() => router.push(item.href)} className="w-full text-left p-4 rounded-lg hover:bg-secondary flex items-center justify-between transition-colors">
                                    <div className="flex items-center gap-4">
                                        <item.icon className="w-6 h-6 text-primary" />
                                        <span className="font-semibold text-lg">{item.label}</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </button>
                           ))}
                        </div>

                         <div className="pt-4">
                            <Button variant="outline" className="w-full h-12 text-lg" onClick={handleLogout}>
                                <LogOut className="mr-2" /> Keluar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
