
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Notebook, Trash2, Edit, Users } from 'lucide-react';
import { type Note } from '@/types/notebook';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Simulate data
import notebookGroupsData from '@/data/notebook-groups.json';

const LOCAL_STORAGE_KEY_NOTES = 'notebook_notes_v1';

export default function NotebookListPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedNotes = localStorage.getItem(LOCAL_STORAGE_KEY_NOTES);
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      }
    } catch (error) {
      console.error("Failed to load notes", error);
    }
  }, []);

  const handleCreateNew = () => {
    router.push(`/notebook/new`);
  };

  const handleCardClick = (id: string) => {
    router.push(`/notebook/${id}`);
  }

  const handleEdit = (id: string) => {
    router.push(`/notebook/${id}?edit=true`);
  };

  const handleDelete = (id: string) => {
    try {
      const updatedNotes = notes.filter(n => n.id !== id);
      setNotes(updatedNotes);
      localStorage.setItem(LOCAL_STORAGE_KEY_NOTES, JSON.stringify(updatedNotes));
    } catch (error) {
      console.error("Failed to delete note from localStorage", error);
    }
    setIsDeleting(null);
  };
  
  const getProgress = (note: Note) => {
    if (note.items.length === 0) return 0;
    const completedCount = note.items.filter(item => item.completed).length;
    return (completedCount / note.items.length) * 100;
  }
  
  const renderPersonalNotes = () => (
    <div className="space-y-4">
      <Button onClick={handleCreateNew} className="w-full md:w-auto">
        <Plus className="mr-2" /> Buat Catatan Baru
      </Button>
      
      {notes.length > 0 ? (
        notes.map(note => {
          const progress = getProgress(note);
          const isCompleted = progress === 100 && note.items.length > 0;

          return (
          <Card key={note.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleCardClick(note.id)}>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span className="truncate">{note.title || 'Tanpa Judul'}</span>
                    <div className="flex items-center gap-2">
                       {!isCompleted && (
                         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleEdit(note.id) }}>
                           <Edit className="h-4 w-4" />
                         </Button>
                       )}
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); setIsDeleting(note.id) }}>
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Progress value={progress} className="w-full" />
                <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
                  {note.items.filter(i => i.completed).length} / {note.items.length}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Dibuat: {new Date(note.createdAt).toLocaleDateString('id-ID')}
              </p>
            </CardContent>
          </Card>
        )})
      ) : (
         <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <Notebook className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Belum Ada Catatan</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Klik "Buat Catatan Baru" untuk memulai.
          </p>
        </div>
      )}
    </div>
  );

  const renderGroupNotes = () => (
    <div className="space-y-4">
      <Button className="w-full md:w-auto">
        <Plus className="mr-2" /> Buat Grup Baru
      </Button>
      {notebookGroupsData.length > 0 ? (
        notebookGroupsData.map(group => (
          <Card key={group.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>{group.title}</CardTitle>
              <CardDescription>{group.tasks.length} Tugas Aktif</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2 overflow-hidden">
                  {group.members.slice(0, 5).map(member => (
                    <Avatar key={member.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                      <AvatarImage src={member.avatarUrl} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ))}
                   {group.members.length > 5 && <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-background"><AvatarFallback>+{group.members.length - 5}</AvatarFallback></Avatar>}
                </div>
                <Users className="text-muted-foreground"/>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Belum Ada Grup</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Klik "Buat Grup Baru" untuk memulai kolaborasi.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
       <AlertDialog open={!!isDeleting} onOpenChange={(open) => !open && setIsDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak bisa dibatalkan. Ini akan menghapus catatan secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(isDeleting!)}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
            <h1 className="text-4xl font-bold font-headline tracking-tight">Catatan Cerdas</h1>
            <p className="text-muted-foreground mt-2 text-lg">
                Organisir ide dan tugas Anda dengan checklist canggih.
            </p>
        </div>
        
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal">Pribadi</TabsTrigger>
            <TabsTrigger value="group">Grup</TabsTrigger>
          </TabsList>
          <TabsContent value="personal" className="mt-6">
            {renderPersonalNotes()}
          </TabsContent>
          <TabsContent value="group" className="mt-6">
            {renderGroupNotes()}
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}
