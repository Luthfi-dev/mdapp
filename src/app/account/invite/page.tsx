
'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Gift, Send, Share2, ArrowLeft } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// Placeholder user data
const user = {
    referralCode: 'SANA22',
    referralLink: 'https://toolkit.com/join?ref=SANA22'
};

export default function InvitePage() {
    const { toast } = useToast();
    const router = useRouter();

    const copyToClipboard = (text: string, type: 'link' | 'code') => {
        navigator.clipboard.writeText(text);
        toast({
            title: `${type === 'link' ? 'Link' : 'Kode'} Referral Disalin!`,
            description: `Ajak temanmu untuk bergabung dan dapatkan hadiahnya.`
        });
    };
    
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Gabung di All-in-One Toolkit!',
                text: `Gunakan kode referral saya: ${user.referralCode} atau klik link untuk mendaftar dan dapatkan bonus!`,
                url: user.referralLink,
            }).catch((error) => console.log('Error sharing', error));
        } else {
            copyToClipboard(user.referralLink, 'link');
        }
    };

    return (
        <div className="min-h-screen bg-secondary/30">
            <div className="container mx-auto max-w-2xl px-4 py-8 pb-24">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali
                </Button>

                <div className="text-center bg-gradient-to-br from-primary/80 to-primary p-8 rounded-2xl shadow-lg text-primary-foreground mb-8">
                     <Gift className="mx-auto h-16 w-16 mb-4 animate-pulse" />
                     <h1 className="text-3xl font-bold">Undang Teman, Dapatkan Hadiah!</h1>
                     <p className="mt-2 opacity-90 max-w-md mx-auto">
                        Bagikan kode referral Anda. Untuk setiap teman yang bergabung, Anda berdua akan mendapatkan 200 Poin Coin gratis!
                    </p>
                </div>

                <Card className="mb-8">
                     <CardHeader>
                        <CardTitle>Bagikan Undangan Anda</CardTitle>
                        <CardDescription>Salin link atau kode di bawah ini dan bagikan ke teman-teman Anda.</CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="referral-link">Link Referral Anda</Label>
                            <div className="flex gap-2">
                                <Input id="referral-link" value={user.referralLink} readOnly />
                                <Button size="icon" variant="outline" onClick={() => copyToClipboard(user.referralLink, 'link')}><Copy/></Button>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="referral-code">Atau Gunakan Kode</Label>
                            <div className="flex gap-2">
                                <Input id="referral-code" value={user.referralCode} readOnly className="text-center font-bold tracking-widest uppercase" />
                                <Button size="icon" variant="outline" onClick={() => copyToClipboard(user.referralCode, 'code')}><Copy/></Button>
                            </div>
                        </div>
                        <Button className="w-full" onClick={handleShare}>
                            <Share2 className="mr-2" /> Bagikan Sekarang
                        </Button>
                    </CardContent>
                </Card>
                
                 <Card>
                     <CardHeader>
                        <CardTitle>Punya Kode Referral?</CardTitle>
                        <CardDescription>Masukkan kode dari teman Anda untuk mengklaim bonus Poin Coin.</CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-2">
                        <Label htmlFor="enter-code">Masukkan Kode Referral</Label>
                         <div className="flex gap-2">
                            <Input id="enter-code" placeholder="Ketik kode disini..." />
                            <Button><Send/></Button>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
