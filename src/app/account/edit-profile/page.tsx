
'use client';
import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Camera, Loader2, Mail, Save, User, Phone } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { optimizeImage } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

export default function EditProfilePage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, isAuthenticated, isLoading: isAuthLoading, fetchWithAuth } = useAuth();
    
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [avatarPreview, setAvatarPreview] = useState('');
    const [avatarData, setAvatarData] = useState(''); // Store base64 data for submission
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            router.push('/account');
        }
        if (user) {
            setName(user.name);
            setPhone(user.phone || '');
            setAvatarPreview(user.avatar || '');
        }
    }, [user, isAuthenticated, isAuthLoading, router]);
    
    const getInitials = (nameStr: string) => {
        return nameStr.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
             if (!file.type.startsWith('image/')) {
                toast({ variant: 'destructive', title: 'File Tidak Valid', description: 'Hanya file gambar yang diizinkan.' });
                return;
            }
            try {
                const optimizedFile = await optimizeImage(file, 256);
                const reader = new FileReader();
                reader.onloadend = () => {
                    const dataUrl = reader.result as string;
                    setAvatarPreview(dataUrl);
                    setAvatarData(dataUrl); // Save the data for submission
                };
                reader.readAsDataURL(optimizedFile);
            } catch (error) {
                console.error("Image optimization failed:", error);
                toast({ variant: 'destructive', title: 'Gagal Memproses Gambar' });
            }
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            const response = await fetchWithAuth('/api/user/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    phone,
                    avatar: avatarData || user?.avatar // Send new avatar data, or keep old one if not changed
                })
            });

            const result = await response.json();

            if (result.success) {
                toast({
                    title: "Profil Diperbarui!",
                    description: "Perubahan pada profil Anda telah berhasil disimpan."
                });
                // It's good practice to force a token refresh or re-fetch user data
                // to get the latest info (name, avatar url etc.) reflected everywhere.
                // A simple way is to push user to profile page, which re-evaluates auth state.
                router.push('/account/profile');
                 router.refresh(); // Tell Next.js to refresh server components
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Gagal Menyimpan',
                    description: result.message || 'Terjadi kesalahan saat menyimpan profil.'
                });
            }
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error', description: 'Tidak dapat terhubung ke server.' });
        } finally {
            setIsSaving(false);
        }
    }
    
    if (isAuthLoading || !user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary/30">
             <div className="container mx-auto max-w-2xl px-4 py-8 pb-24">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Profil</CardTitle>
                        <CardDescription>Perbarui informasi pribadi dan foto profil Anda.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-8">
                             <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <Avatar className="w-32 h-32 text-5xl">
                                        <AvatarImage src={avatarPreview} data-ai-hint="profile picture" />
                                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                    </Avatar>
                                     <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="icon" 
                                        className="absolute bottom-1 right-1 rounded-full h-10 w-10 bg-background"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Camera className="w-5 h-5" />
                                    </Button>
                                    <Input 
                                        type="file" 
                                        className="hidden" 
                                        ref={fileInputRef} 
                                        onChange={handleImageUpload} 
                                        accept="image/*"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10"/>
                                </div>
                            </div>

                             <div className="space-y-2">
                                <Label htmlFor="email">Alamat Email</Label>
                                 <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input id="email" value={user.email} disabled className="pl-10"/>
                                </div>
                                <p className="text-xs text-muted-foreground">Email tidak dapat diubah.</p>
                            </div>

                             <div className="space-y-2">
                                <Label htmlFor="phone">Nomor Telepon (Opsional)</Label>
                                 <div className="relative">
                                     <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                     <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Contoh: 08123456789" className="pl-10"/>
                                 </div>
                            </div>

                            <Button type="submit" disabled={isSaving} className="w-full">
                                {isSaving ? <Loader2 className="mr-2 animate-spin"/> : <Save className="mr-2" />}
                                Simpan Perubahan
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
