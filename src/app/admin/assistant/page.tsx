'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, Bot } from "lucide-react";

// Simulate fetching and saving data
import assistantData from '@/data/assistant.json';

interface AssistantSettings {
  name: string;
  systemPrompt: string;
}

export default function AssistantSettingsPage() {
  const [settings, setSettings] = useState<AssistantSettings>({ name: '', systemPrompt: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching data from a file or API
    setSettings(assistantData);
    setIsLoading(false);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // In a real app, this would be an API call to your backend
    // to save the JSON file or update the database.
    console.log("Saving assistant settings:", JSON.stringify(settings, null, 2));

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSaving(false);
    toast({
      title: "Pengaturan Disimpan!",
      description: "Pengaturan asisten AI telah berhasil diperbarui.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot /> Pengaturan Asisten AI
          </CardTitle>
          <CardDescription>
            Kustomisasi nama, kepribadian, dan pengetahuan dasar dari asisten AI Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="assistant-name">Nama Asisten</Label>
            <Input 
              id="assistant-name" 
              placeholder="Contoh: Asisten Cerdas" 
              value={settings.name}
              onChange={(e) => setSettings(s => ({ ...s, name: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">Nama ini akan ditampilkan di header halaman chat.</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="system-prompt">System Prompt (Kepribadian & Pengetahuan Dasar)</Label>
            <Textarea 
              id="system-prompt" 
              placeholder="Deskripsikan kepribadian dan peran asisten..." 
              value={settings.systemPrompt}
              onChange={(e) => setSettings(s => ({ ...s, systemPrompt: e.target.value }))}
              rows={15}
            />
            <p className="text-xs text-muted-foreground">
              Ini adalah instruksi inti untuk AI. Jelaskan perannya, gaya bahasanya (misal: Gen Z, ceria, sopan), dan pengetahuan dasar seperti siapa pembuatnya.
            </p>
          </div>
          
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Simpan Pengaturan
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}