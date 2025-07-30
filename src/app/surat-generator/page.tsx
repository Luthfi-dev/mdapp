
'use client';

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
    FileSignature, Plus, Trash2, Pilcrow, Share2, UploadCloud, Eye, Image as ImageIcon,
    Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, RotateCcw
} from 'lucide-react';
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
import * as docx from 'docx-preview';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface SuratField {
  id: string;
  label: string;
}

const initialFields: SuratField[] = [
    { id: 'nama_lengkap', label: 'Nama Lengkap' },
    { id: 'jabatan', label: 'Jabatan' },
    { id: 'tanggal', label: 'Tanggal Surat' },
];

const initialTemplate = `Kepada Yth.
Bapak/Ibu <b>{{nama_lengkap}}</b>
di Tempat

Dengan hormat,

Sehubungan dengan akan dilaksanakannya evaluasi kinerja bulanan, dengan ini kami mengundang Bapak/Ibu untuk hadir dalam rapat yang akan diselenggarakan pada:

Hari/Tanggal : Senin, 30 September 2024
Waktu         : 10:00 WIB
Tempat        : Ruang Rapat Utama

Mengingat pentingnya acara ini, kami harapkan kehadiran Bapak/Ibu tepat pada waktunya.

Demikian surat undangan ini kami sampaikan. Atas perhatian dan kehadiran Bapak/Ibu, kami ucapkan terima kasih.

Hormat kami,


Manajemen Perusahaan
<i>{{jabatan}}</i>`;

export default function SuratGeneratorPage() {
    const [fields, setFields] = useState<SuratField[]>(initialFields);
    const [newFieldLabel, setNewFieldLabel] = useState('');
    const [isAddFieldAlertOpen, setIsAddFieldAlertOpen] = useState(false);
    const [template, setTemplate] = useState(initialTemplate);
    const [letterheadImage, setLetterheadImage] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);
    const { toast } = useToast();
    const editorRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const addField = () => {
        if (!newFieldLabel.trim()) {
            toast({ variant: 'destructive', title: 'Label Tidak Boleh Kosong', description: 'Silakan isi nama label untuk field baru.' });
            return;
        }
        const newId = newFieldLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
        if (fields.some(f => f.id === newId)) {
            toast({ variant: 'destructive', title: 'Field Sudah Ada', description: 'ID field yang dibuat dari label ini sudah ada.' });
            return;
        }
        const newField: SuratField = { id: newId, label: newFieldLabel.trim() };
        setFields([...fields, newField]);
        setNewFieldLabel('');
        setIsAddFieldAlertOpen(false);
    };

    const removeField = (id: string) => {
        setFields(fields.filter(field => field.id !== id));
    };

    const insertPlaceholder = (id: string) => {
        const placeholder = `{{${id}}}`;
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand('insertText', false, placeholder);
        }
    };
    
    const handleDocxUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && (file.name.endsWith('.docx'))) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const arrayBuffer = event.target?.result;
                if(arrayBuffer instanceof ArrayBuffer) {
                    const tempDiv = document.createElement('div');
                    await docx.renderAsync(arrayBuffer, tempDiv);
                    // Remove style tags before extracting text
                    tempDiv.querySelectorAll('style').forEach(styleEl => styleEl.remove());
                    // Use innerHTML to preserve basic formatting like paragraphs and breaks
                    setTemplate(tempDiv.innerHTML);
                    if (editorRef.current) {
                        editorRef.current.innerHTML = tempDiv.innerHTML;
                    }
                    toast({ title: 'Upload Berhasil', description: 'Template dari file .docx berhasil dimuat.' });
                }
            };
            reader.readAsArrayBuffer(file);
        } else if(file) {
            toast({ variant: "destructive", title: "Format Salah", description: "Hanya file .docx yang didukung."})
        }
    };

     const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLetterheadImage(reader.result as string);
                toast({ title: "Kop Surat Diunggah", description: "Gambar akan muncul di bagian atas surat."});
            };
            reader.readAsDataURL(file);
        } else if (file) {
            toast({ variant: 'destructive', title: 'File Tidak Valid', description: 'Silakan pilih file gambar (JPG, PNG, dll).' });
        }
    };
    
    const executeCommand = (command: 'bold' | 'italic' | 'underline' | 'justifyLeft' | 'justifyCenter' | 'justifyRight') => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false);
        }
    };

    const getFullTemplate = () => {
        let fullTemplate = editorRef.current?.innerHTML || template;
        if (letterheadImage) {
            const imgTag = `<div style="text-align: center; margin-bottom: 20px;"><img src="${letterheadImage}" alt="Kop Surat" style="max-width: 100%; height: auto;" /></div><hr/>`;
            fullTemplate = imgTag + '<br/>' + fullTemplate;
        }
        return fullTemplate;
    }

    const handleShare = () => {
        if (!isClient) return;
        const dataToEncode = {
            template: getFullTemplate(),
            fields: fields
        };
        const encodedData = btoa(encodeURIComponent(JSON.stringify(dataToEncode)));
        const url = `${window.location.origin}/surat/share?data=${encodedData}`;

        navigator.clipboard.writeText(url);
        toast({ title: 'Link Disalin!', description: 'Link surat telah disalin ke clipboard.' });
    }
    
    const handlePreview = () => {
        if (!isClient) return;
        const dataToEncode = {
            template: getFullTemplate(),
            fields: fields
        };
        const encodedData = btoa(encodeURIComponent(JSON.stringify(dataToEncode)));
        const url = `/surat/share?data=${encodedData}`;
        router.push(url);
    }
  
    return (
        <div className="container mx-auto px-4 py-8 pb-24">
            <AlertDialog open={isAddFieldAlertOpen} onOpenChange={setIsAddFieldAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tambah Field Baru</AlertDialogTitle>
                        <AlertDialogDescription>Masukkan nama label untuk field kustom baru Anda. ID unik akan dibuat.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Label htmlFor="new-field-label">Label Field</Label>
                        <Input id="new-field-label" value={newFieldLabel} onChange={(e) => setNewFieldLabel(e.target.value)} placeholder="Contoh: NIP, Alamat" onKeyDown={(e) => e.key === 'Enter' && addField()} />
                    </div>
                    <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={addField}>Tambah</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 order-2 lg:order-1">
                     <Card className="shadow-lg h-full">
                        <CardHeader className='flex-row items-center justify-between'>
                            <div>
                                <CardTitle className="flex items-center gap-3">Editor Template</CardTitle>
                                <CardDescription>Tulis, format, atau unggah template surat Anda.</CardDescription>
                            </div>
                             <Button variant="ghost" size="icon" onClick={() => { setTemplate(''); if(editorRef.current) editorRef.current.innerHTML = ''; }}>
                                <Trash2 className="w-5 h-5 text-destructive" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                             <div className="border rounded-t-md p-2 flex items-center gap-2 bg-secondary/50 flex-wrap">
                                <Button variant="outline" size="icon" onMouseDown={(e) => { e.preventDefault(); executeCommand('bold'); }}><Bold /></Button>
                                <Button variant="outline" size="icon" onMouseDown={(e) => { e.preventDefault(); executeCommand('italic'); }}><Italic /></Button>
                                <Button variant="outline" size="icon" onMouseDown={(e) => { e.preventDefault(); executeCommand('underline'); }}><Underline /></Button>
                                <div className="border-l h-6 mx-1"></div>
                                <Button variant="outline" size="icon" onMouseDown={(e) => { e.preventDefault(); executeCommand('justifyLeft'); }}><AlignLeft /></Button>
                                <Button variant="outline" size="icon" onMouseDown={(e) => { e.preventDefault(); executeCommand('justifyCenter'); }}><AlignCenter /></Button>
                                <Button variant="outline" size="icon" onMouseDown={(e) => { e.preventDefault(); executeCommand('justifyRight'); }}><AlignRight /></Button>
                            </div>
                            <div
                                ref={editorRef}
                                contentEditable={true}
                                onInput={(e) => setTemplate(e.currentTarget.innerHTML)}
                                dangerouslySetInnerHTML={{ __html: template }}
                                className="min-h-[500px] w-full rounded-b-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm whitespace-pre-wrap font-mono"
                                suppressContentEditableWarning={true}
                             />
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 order-1 lg:order-2 space-y-6">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3"><FileSignature className="w-6 h-6 text-primary" />Generator Surat</CardTitle>
                            <CardDescription>Bagikan atau pratinjau surat dinamis Anda.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                             <Button onClick={handleShare} className="w-full" variant="secondary"><Share2 className="mr-2 h-4 w-4" /> Salin Link</Button>
                            <Button onClick={handlePreview} className="w-full"><Eye className="mr-2 h-4 w-4" /> Pratinjau & Isi</Button>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg">
                        <CardHeader>
                             <CardTitle className="text-xl">Opsi Template</CardTitle>
                             <CardDescription>Unggah .docx atau kop surat.</CardDescription>
                        </CardHeader>
                         <CardContent className="space-y-4">
                             <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg text-center">
                                 <UploadCloud className="w-10 h-10 text-muted-foreground mb-2"/>
                                 <Label htmlFor="template-file" className="text-primary font-semibold cursor-pointer hover:underline">Unggah Template .docx</Label>
                                 <Input id="template-file" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleDocxUpload} className="hidden"/>
                             </div>
                             <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg text-center">
                                {letterheadImage ? (
                                    <div className="relative w-full aspect-video">
                                        <Image src={letterheadImage} alt="Pratinjau Kop Surat" layout="fill" objectFit='contain' />
                                    </div>
                                ) : (
                                    <ImageIcon className="w-10 h-10 text-muted-foreground mb-2"/>
                                )}
                                 <div className='flex items-center gap-4 mt-2'>
                                    <Label htmlFor="image-file" className={cn("text-primary font-semibold cursor-pointer hover:underline", letterheadImage && "text-sm")}>{letterheadImage ? 'Ganti Kop Surat' : 'Unggah Kop Surat'}</Label>
                                    {letterheadImage && <Button variant="ghost" size="icon" className='h-6 w-6' onClick={() => setLetterheadImage(null)}><Trash2 className="h-4 w-4 text-destructive"/></Button>}
                                 </div>
                                <Input id="image-file" type="file" accept="image/*" onChange={handleImageUpload} className="hidden"/>
                             </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl">Field Dinamis</CardTitle>
                             <CardDescription>Klik untuk menyisipkan ke template.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {fields.map(field => (
                                    <div key={field.id} className="flex items-center gap-2">
                                        <Button variant="outline" className="flex-grow justify-start" onClick={() => insertPlaceholder(field.id)}><Pilcrow className="mr-2 h-4 w-4 text-primary" />{field.label}</Button>
                                        <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9" onClick={() => removeField(field.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </div>
                                ))}
                            </div>
                            <Button onClick={() => setIsAddFieldAlertOpen(true)} className="w-full" variant="outline"><Plus className="mr-2 h-4 w-4" /> Tambah Field</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
