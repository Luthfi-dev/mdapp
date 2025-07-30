
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileSignature, Edit, Trash2, Loader2, MoreVertical } from 'lucide-react';
import type { Template } from '@/types/surat';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

const LOCAL_STORAGE_KEY_TEMPLATES = 'surat_templates_v1';

export default function SuratListPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedTemplates = localStorage.getItem(LOCAL_STORAGE_KEY_TEMPLATES);
      if (storedTemplates) {
        setTemplates(JSON.parse(storedTemplates));
      }
    } catch (error) {
      console.error("Failed to load templates from localStorage", error);
    }
    setIsLoading(false);
  }, []);

  const handleEdit = (id: string) => {
    router.push(`/surat-generator?id=${id}`);
  };

  const handleDelete = (id: string) => {
    try {
      const updatedTemplates = templates.filter(t => t.id !== id);
      setTemplates(updatedTemplates);
      localStorage.setItem(LOCAL_STORAGE_KEY_TEMPLATES, JSON.stringify(updatedTemplates));
    } catch (error) {
      console.error("Failed to delete template from localStorage", error);
    }
    setIsDeleting(null);
  };
  
  const handleCreateNew = () => {
    router.push('/surat-generator');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <AlertDialog open={!!isDeleting} onOpenChange={(open) => !open && setIsDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak bisa dibatalkan. Ini akan menghapus template surat secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(isDeleting!)}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">Template Surat Anda</h1>
            <p className="text-muted-foreground mt-1">
              Kelola, edit, atau buat template surat baru.
            </p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2" /> Buat Baru
          </Button>
        </div>

        {templates.length > 0 ? (
          <div className="space-y-4">
            {templates.map(template => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileSignature className="w-8 h-8 text-primary shrink-0" />
                    <div>
                      <h3 className="font-semibold">{template.title || 'Tanpa Judul'}</h3>
                      <p className="text-sm text-muted-foreground">
                        Terakhir diubah: {new Date(template.lastModified).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(template.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsDeleting(template.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Hapus</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <FileSignature className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Belum Ada Template</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Klik "Buat Baru" untuk memulai template surat pertama Anda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
