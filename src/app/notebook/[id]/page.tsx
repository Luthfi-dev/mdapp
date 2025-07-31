
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Save, HelpCircle, ChevronsDownUp, ListPlus } from 'lucide-react';
import { type Note, type ChecklistItem } from '@/types/notebook';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Progress } from '@/components/ui/progress';

const LOCAL_STORAGE_KEY_NOTES = 'notebook_notes_v1';

export default function NotebookEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const { toast } = useToast();
  
  const [note, setNote] = useState<Note | null>(null);
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [bulkAddCount, setBulkAddCount] = useState(10);
  const [isNumbered, setIsNumbered] = useState(false);

  useEffect(() => {
    if (id === 'new') {
      setNote({
        id: `note_${Date.now()}`,
        title: '',
        items: [],
        createdAt: new Date().toISOString(),
      });
    } else {
      try {
        const storedNotes = localStorage.getItem(LOCAL_STORAGE_KEY_NOTES);
        if (storedNotes) {
          const notes: Note[] = JSON.parse(storedNotes);
          const currentNote = notes.find(n => n.id === id);
          if (currentNote) {
            setNote(currentNote);
          } else {
            router.push('/notebook');
          }
        }
      } catch (error) {
        console.error("Failed to load note", error);
        router.push('/notebook');
      }
    }
  }, [id, router]);

  const updateNote = (field: keyof Note, value: any) => {
    if (!note) return;
    setNote({ ...note, [field]: value });
  };

  const addItem = () => {
    if (!note) return;
    const newItem: ChecklistItem = {
      id: `item_${Date.now()}`,
      label: '',
      completed: false,
    };
    updateNote('items', [...note.items, newItem]);
  };

  const updateItem = (itemId: string, newLabel: string) => {
    if (!note) return;
    const updatedItems = note.items.map(item => 
      item.id === itemId ? { ...item, label: newLabel } : item
    );
    updateNote('items', updatedItems);
  };

  const toggleItemCompletion = (itemId: string) => {
    if (!note) return;
    const updatedItems = note.items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    updateNote('items', updatedItems);
  };

  const removeItem = (itemId: string) => {
    if (!note) return;
    updateNote('items', note.items.filter(item => item.id !== itemId));
  };
  
  const handleBulkAdd = () => {
     if (!note || bulkAddCount <= 0) return;
     const newItems: ChecklistItem[] = Array.from({ length: bulkAddCount }, (_, i) => ({
      id: `item_${Date.now()}_${i}`,
      label: isNumbered ? `${note.items.length + i + 1}. ` : '',
      completed: false,
    }));
    updateNote('items', [...note.items, ...newItems]);
    setIsBulkAddOpen(false);
    setBulkAddCount(10);
    setIsNumbered(false);
  }
  
  const handleSave = () => {
    if (!note) return;
    if (!note.title.trim()) {
        toast({ variant: 'destructive', title: 'Judul tidak boleh kosong!' });
        return;
    }
    
    try {
      const storedNotesRaw = localStorage.getItem(LOCAL_STORAGE_KEY_NOTES);
      let notes: Note[] = storedNotesRaw ? JSON.parse(storedNotesRaw) : [];
      
      const existingIndex = notes.findIndex(n => n.id === note.id);
      if (existingIndex > -1) {
        notes[existingIndex] = note;
      } else {
        notes.push(note);
      }
      
      localStorage.setItem(LOCAL_STORAGE_KEY_NOTES, JSON.stringify(notes));
      toast({ title: 'Catatan Disimpan!', description: `"${note.title}" telah berhasil disimpan.` });
      router.push('/notebook');
    } catch (error) {
        console.error("Failed to save note", error);
        toast({ variant: 'destructive', title: 'Gagal Menyimpan', description: 'Terjadi kesalahan saat menyimpan catatan.' });
    }
  };

  const progress = useMemo(() => {
    if (!note || note.items.length === 0) return 0;
    const completedCount = note.items.filter(item => item.completed).length;
    return (completedCount / note.items.length) * 100;
  }, [note]);

  if (!note) {
    return <div>Loading...</div>; // Or a proper loader
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
       <AlertDialog open={isBulkAddOpen} onOpenChange={setIsBulkAddOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Buat Banyak Item</AlertDialogTitle>
                  <AlertDialogDescription>Masukkan jumlah item checklist yang ingin Anda buat secara otomatis.</AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4 space-y-4">
                  <div className='space-y-2'>
                    <Label htmlFor="bulk-add-count">Jumlah Item</Label>
                    <Input id="bulk-add-count" type="number" value={bulkAddCount} onChange={(e) => setBulkAddCount(Number(e.target.value))} min="1" max="100"/>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="is-numbered" checked={isNumbered} onCheckedChange={(checked) => setIsNumbered(checked as boolean)} />
                    <Label htmlFor="is-numbered">Aktifkan Penomoran Otomatis</Label>
                  </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkAdd}>Buat</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <Input 
                        placeholder="Judul Catatan Anda..." 
                        value={note.title}
                        onChange={(e) => updateNote('title', e.target.value)}
                        className="text-2xl font-bold border-0 shadow-none focus-visible:ring-0 p-0"
                    />
                    <AlertDialog>
                       <AlertDialogTrigger asChild>
                         <Button variant="ghost" size="icon"><HelpCircle className="h-5 w-5"/></Button>
                       </AlertDialogTrigger>
                       <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cara Penggunaan Jurnal Cerdas</AlertDialogTitle>
                          </AlertDialogHeader>
                           <div className="space-y-3 text-sm text-muted-foreground">
                            <p>1. Beri nama catatan Anda dengan mengklik teks "Judul Catatan".</p>
                            <p>2. Tambah item satu per satu dengan tombol <b className="text-foreground">Tambah Item</b>.</p>
                            <p>3. Buat banyak item sekaligus dengan tombol <b className="text-foreground">Buat Banyak Item</b>.</p>
                            <p>4. Centang kotak di samping item untuk menandainya sebagai selesai.</p>
                            <p>5. Klik <b className="text-foreground">Simpan Catatan</b> untuk menyimpan semua perubahan Anda.</p>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogAction>Mengerti!</AlertDialogAction>
                          </AlertDialogFooter>
                       </AlertDialogContent>
                    </AlertDialog>
                </CardTitle>
                <CardDescription>
                    <Progress value={progress} className="w-full mt-2" />
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                  {note.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 group">
                      <Checkbox 
                        checked={item.completed}
                        onCheckedChange={() => toggleItemCompletion(item.id)}
                        className="w-5 h-5"
                      />
                      <Input 
                        value={item.label}
                        onChange={(e) => updateItem(item.id, e.target.value)}
                        className={`border-0 shadow-none focus-visible:ring-0 p-1 h-auto ${item.completed ? 'line-through text-muted-foreground' : ''}`}
                        placeholder='Isi tugas disini...'
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={addItem} variant="outline" className="w-full">
                        <Plus className="mr-2"/> Tambah Item
                    </Button>
                     <Button onClick={() => setIsBulkAddOpen(true)} variant="outline" className="w-full">
                        <ListPlus className="mr-2"/> Buat Banyak Item
                    </Button>
                </div>
                
                <Button onClick={handleSave} className="w-full">
                    <Save className="mr-2"/> Simpan Catatan
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}

