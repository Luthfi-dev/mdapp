
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileSignature, Plus, Trash2, Pilcrow, Bold, Italic, Underline, List } from 'lucide-react';
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

interface SuratField {
  id: string;
  label: string;
  placeholder: string;
}

const initialFields: SuratField[] = [
    { id: 'nomor_surat', label: 'Nomor Surat', placeholder: 'Contoh: 123/IV/2024' },
    { id: 'perihal', label: 'Perihal', placeholder: 'Contoh: Undangan Rapat' },
    { id: 'tanggal', label: 'Tanggal', placeholder: 'Contoh: 24 Mei 2024' },
    { id: 'penerima', label: 'Penerima', placeholder: 'Contoh: Yth. Bapak/Ibu...' },
];


export default function SuratGeneratorPage() {
    const [fields, setFields] = useState<SuratField[]>(initialFields);
    const [newFieldLabel, setNewFieldLabel] = useState('');
    const [isAddFieldAlertOpen, setIsAddFieldAlertOpen] = useState(false);
    const [template, setTemplate] = useState(
`Kepada Yth.
Bapak/Ibu {{penerima}}
di Tempat

Dengan hormat,

Sehubungan dengan akan dilaksanakannya evaluasi kinerja, dengan ini kami mengundang Bapak/Ibu untuk hadir dalam rapat yang akan diselenggarakan pada:

Hari/Tanggal : 
Waktu         : 
Tempat        : 

Demikian surat undangan ini kami sampaikan. Atas perhatian dan kehadiran Bapak/Ibu, kami ucapkan terima kasih.

Hormat kami,


(Nama Anda)`
    );
    const { toast } = useToast();
    const editorRef = useRef<HTMLTextAreaElement>(null);
    const [cursorPosition, setCursorPosition] = useState<number | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setTemplate(event.target?.result as string);
            };
            reader.readAsText(file);
        }
    };

    const saveCursorPosition = () => {
        if (editorRef.current) {
            setCursorPosition(editorRef.current.selectionStart);
        }
    };

    const addField = () => {
        if (!newFieldLabel) {
            toast({
                variant: 'destructive',
                title: 'Label Tidak Boleh Kosong',
                description: 'Silakan isi nama label untuk field baru.',
            });
            return;
        }
        const newId = newFieldLabel.toLowerCase().replace(/\s+/g, '_');
        const newField: SuratField = {
            id: newId,
            label: newFieldLabel,
            placeholder: `Masukkan ${newFieldLabel}...`
        };
        setFields([...fields, newField]);
        setNewFieldLabel('');
        setIsAddFieldAlertOpen(false);
        toast({
            title: 'Field Ditambahkan',
            description: `Field "${newFieldLabel}" berhasil ditambahkan.`,
        });
    };

    const removeField = (id: string) => {
        setFields(fields.filter(field => field.id !== id));
    };

    const insertPlaceholder = (id: string) => {
        const placeholder = `{{${id}}}`;
        if (editorRef.current) {
            const start = cursorPosition ?? editorRef.current.selectionStart;
            const end = cursorPosition ?? editorRef.current.selectionEnd;
            const text = editorRef.current.value;
            const newText = text.substring(0, start) + placeholder + text.substring(end);
            setTemplate(newText);
            
            // Focus and set cursor position after placeholder
            setTimeout(() => {
                editorRef.current?.focus();
                const newCursorPos = start + placeholder.length;
                editorRef.current?.setSelectionRange(newCursorPos, newCursorPos);
                setCursorPosition(newCursorPos);
            }, 0);
        }
    };
    
    const executeCommand = (command: 'bold' | 'italic' | 'underline' | 'list') => {
        if (!editorRef.current) return;
        const textarea = editorRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = template.substring(start, end);

        let newText;
        let surrounding;
        switch (command) {
            case 'bold': surrounding = '**'; break;
            case 'italic': surrounding = '*'; break;
            case 'underline': surrounding = '__'; break;
            case 'list': 
                const lines = selectedText.split('\n');
                const listText = lines.map(line => `\n- ${line}`).join('');
                newText = template.substring(0, start) + listText + template.substring(end);
                break;
            default: return;
        }

        if (command !== 'list') {
             newText = template.substring(0, start) + surrounding + selectedText + surrounding + template.substring(end);
        }

        setTemplate(newText);
    }
  
    return (
        <div className="container mx-auto px-4 py-8 pb-24">
            <AlertDialog open={isAddFieldAlertOpen} onOpenChange={setIsAddFieldAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tambah Field Baru</AlertDialogTitle>
                        <AlertDialogDescription>
                            Masukkan nama label untuk field kustom baru Anda. ID unik akan dibuat secara otomatis.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Label htmlFor="new-field-label">Label Field</Label>
                        <Input
                            id="new-field-label"
                            value={newFieldLabel}
                            onChange={(e) => setNewFieldLabel(e.target.value)}
                            placeholder="Contoh: Jabatan"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={addField}>Tambah</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Card className="max-w-4xl mx-auto shadow-xl">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <FileSignature className="w-8 h-8 text-primary" />
                        <CardTitle className="text-3xl font-headline">Generator Surat</CardTitle>
                    </div>
                    <CardDescription>Buat template surat dengan placeholder dinamis.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 space-y-4">
                        <h3 className="font-semibold text-lg">Field Dinamis</h3>
                        <p className="text-sm text-muted-foreground">Klik untuk menyisipkan placeholder ke dalam template Anda.</p>
                        <div className="space-y-2">
                            {fields.map(field => (
                                <div key={field.id} className="flex items-center gap-2">
                                    <Button variant="outline" className="flex-grow justify-start" onClick={() => insertPlaceholder(field.id)}>
                                        <Pilcrow className="mr-2 h-4 w-4" />
                                        {field.label}
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => removeField(field.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button onClick={() => setIsAddFieldAlertOpen(true)} className="w-full">
                            <Plus className="mr-2 h-4 w-4" /> Tambah Field
                        </Button>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                             <h3 className="font-semibold text-lg">Template Surat</h3>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={() => executeCommand('bold')}><Bold className="w-4 h-4"/></Button>
                                <Button variant="outline" size="icon" onClick={() => executeCommand('italic')}><Italic className="w-4 h-4"/></Button>
                                <Button variant="outline" size="icon" onClick={() => executeCommand('underline')}><Underline className="w-4 h-4"/></Button>
                                <Button variant="outline" size="icon" onClick={() => executeCommand('list')}><List className="w-4 h-4"/></Button>
                            </div>
                        </div>
                        <Textarea
                            ref={editorRef}
                            value={template}
                            onChange={(e) => setTemplate(e.target.value)}
                            onFocus={saveCursorPosition}
                            onKeyUp={saveCursorPosition}
                            onMouseDown={saveCursorPosition}
                            rows={20}
                            placeholder="Tulis atau unggah template surat Anda di sini..."
                            className="font-mono text-sm"
                        />
                         <div className="space-y-2">
                             <Label htmlFor="template-file">Unggah Template (.txt)</Label>
                            <Input id="template-file" type="file" accept=".txt" onChange={handleFileChange} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

