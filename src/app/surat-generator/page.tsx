
'use client';

import { useState, useRef, useEffect, ChangeEvent, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
    FileSignature, Plus, Trash2, Pilcrow, Share2, UploadCloud, Eye, Image as ImageIcon,
    Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Hash, Save, Crown, Loader2
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
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { SuratField, Template } from '@/types/surat';
import { AdBanner } from '@/components/AdBanner';
import { loadAppSettings, AppSettings } from '@/data/app-settings';
import { useIsMobile } from '@/hooks/use-mobile';


const LOCAL_STORAGE_KEY_TEMPLATES = 'surat_templates_v1';

const initialFields: SuratField[] = [
    { id: 'nama_lengkap', label: 'Nama Lengkap' },
    { id: 'jabatan', label: 'Jabatan' },
    { id: 'tanggal', label: 'Tanggal Surat' },
];

const initialTemplateContent = `<p style="text-align: right;">{{tanggal}}</p>
<br>
<p>Nomor: {{NOMOR_SURAT_OTOMATIS}}</p>
<br>
<p>Kepada Yth.<br>Bapak/Ibu <b>{{nama_lengkap}}</b><br>di Tempat</p>
<br>
<p>Dengan hormat,</p>
<p>Sehubungan dengan akan dilaksanakannya evaluasi kinerja bulanan, dengan ini kami mengundang Bapak/Ibu untuk hadir dalam rapat yang akan diselenggarakan pada:</p>
<p>Hari/Tanggal : Senin, 30 September 2024<br>Waktu&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : 10:00 WIB<br>Tempat&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : Ruang Rapat Utama</p>
<p>Mengingat pentingnya acara ini, kami harapkan kehadiran Bapak/Ibu tepat pada waktunya.</p>
<p>Demikian surat undangan ini kami sampaikan. Atas perhatian dan kehadiran Bapak/Ibu, kami ucapkan terima kasih.</p>
<br>
<p>Hormat kami,</p>
<br>
<br>
<p><i>Manajemen Perusahaan</i><br><u>{{jabatan}}</u></p>
`;


export default function SuratGeneratorPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [template, setTemplate] = useState<Template | null>(null);
    const [newFieldLabel, setNewFieldLabel] = useState('');
    const [isAddFieldAlertOpen, setIsAddFieldAlertOpen] = useState(false);
    const [isPosterAdOpen, setIsPosterAdOpen] = useState(false);
    
    const [content, setContent] = useState('');
    const [appSettings, setAppSettings] = useState<AppSettings>();

    const { toast } = useToast();
    const editorRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();
    
    // This ref helps prevent cursor jump by avoiding re-renders on every keystroke
    const isFirstRender = useRef(true);


    useEffect(() => {
        const id = searchParams.get('id');
        const storedTemplatesRaw = localStorage.getItem(LOCAL_STORAGE_KEY_TEMPLATES);
        const storedTemplates: Template[] = storedTemplatesRaw ? JSON.parse(storedTemplatesRaw) : [];
        const existingTemplate = id ? storedTemplates.find(t => t.id === id) : null;
        
        const settings = loadAppSettings()['app_surat_generator'];
        setAppSettings(settings);

        if (existingTemplate) {
            setTemplate(existingTemplate);
            setContent(existingTemplate.content);
        } else {
            // Create new template structure
            const newTemplate: Template = {
                id: `surat_${Date.now()}`,
                title: 'Template Surat Baru',
                content: initialTemplateContent,
                fields: initialFields,
                isPro: false,
                ads: {
                    banner: { enabled: true, type: 'manual', value: 'https://placehold.co/728x90.png' },
                    poster: { enabled: true, type: 'manual', value: 'https://placehold.co/300x400.png' },
                },
                lastModified: new Date().toISOString()
            };
            setTemplate(newTemplate);
            setContent(newTemplate.content);
        }
    }, [searchParams]);

    useEffect(() => {
        // Only set the innerHTML on the first render or when the template content changes externally
        if (editorRef.current && (isFirstRender.current || content !== editorRef.current.innerHTML)) {
            editorRef.current.innerHTML = content;
            isFirstRender.current = false;
        }
    }, [content, template]);

    const handleContentUpdate = useCallback(() => {
        if (editorRef.current) {
            const newContent = editorRef.current.innerHTML;
            setContent(newContent);
        }
    }, []);

    const addField = () => {
        if (!template) return;
        if (!newFieldLabel.trim()) {
            toast({ variant: 'destructive', title: 'Label Tidak Boleh Kosong', description: 'Silakan isi nama label untuk field baru.' });
            return;
        }
        const newId = newFieldLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
        if (template.fields.some(f => f.id === newId) || newId === 'nomor_surat_otomatis') {
            toast({ variant: 'destructive', title: 'Field Sudah Ada', description: 'ID field yang dibuat dari label ini sudah ada.' });
            return;
        }
        const newField: SuratField = { id: newId, label: newFieldLabel.trim() };
        setTemplate({ ...template, fields: [...template.fields, newField] });
        setNewFieldLabel('');
        setIsAddFieldAlertOpen(false);
    };

    const removeField = (idToRemove: string) => {
        if (!template) return;
        setTemplate({ ...template, fields: template.fields.filter(field => field.id !== idToRemove) });
    };

    const insertPlaceholder = (id: string) => {
        const placeholder = `{{${id}}}`;
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand('insertText', false, placeholder);
            // No need to update state here, onBlur will handle it.
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
                    tempDiv.querySelectorAll('style').forEach(styleEl => styleEl.remove());
                    
                    const newContent = tempDiv.innerHTML;
                    if (editorRef.current) {
                        editorRef.current.innerHTML = newContent;
                        handleContentUpdate(); // Explicitly update state after upload
                    }
                    toast({ title: 'Upload Berhasil', description: 'Konten dari file .docx berhasil dimuat.' });
                }
            };
            reader.readAsArrayBuffer(file);
        } else if(file) {
            toast({ variant: "destructive", title: "Format Salah", description: "Hanya file .docx yang didukung."})
        }
    };

     const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (!template) return;
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newContent = `<p style="text-align: center;"><img src="${reader.result as string}" alt="Kop Surat" style="max-width: 100%; height: auto;" /></p><hr>${editorRef.current?.innerHTML || ''}`;
                if (editorRef.current) {
                    editorRef.current.innerHTML = newContent;
                    handleContentUpdate();
                }
                toast({ title: "Kop Surat Ditambahkan", description: "Gambar telah ditambahkan ke awal template."});
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

    const handleSaveTemplate = () => {
        if (!template) return;
        const currentContent = editorRef.current?.innerHTML || content;

        // Pro feature validation
        if (appSettings?.isPro && currentContent.includes('{{NOMOR_SURAT_OTOMATIS}}')) {
             toast({
                variant: 'destructive',
                title: 'Simpan Gagal: Fitur Pro Digunakan',
                description: 'Template ini menggunakan {{NOMOR_SURAT_OTOMATIS}}. Harap hapus fitur ini untuk menyimpan karena Mode Pro aktif.',
                duration: 7000,
            });
            return; // Stop the save process
        }

        const updatedTemplate = { ...template, content: currentContent, lastModified: new Date().toISOString() };
        
        const storedTemplatesRaw = localStorage.getItem(LOCAL_STORAGE_KEY_TEMPLATES);
        let storedTemplates: Template[] = storedTemplatesRaw ? JSON.parse(storedTemplatesRaw) : [];
        
        const existingIndex = storedTemplates.findIndex(t => t.id === template.id);
        if (existingIndex > -1) {
            storedTemplates[existingIndex] = updatedTemplate;
        } else {
            storedTemplates.push(updatedTemplate);
        }
        
        localStorage.setItem(LOCAL_STORAGE_KEY_TEMPLATES, JSON.stringify(storedTemplates));
        setTemplate(updatedTemplate);

        toast({ title: 'Template Disimpan!', description: `"${template.title}" telah berhasil disimpan.` });
        
        if(appSettings?.ads.poster.enabled){
            setIsPosterAdOpen(true);
        }
    };

    const handleShare = () => {
        if (!template) return;
        const currentContent = editorRef.current?.innerHTML || content;

        // Check for Pro features if user is not Pro
        if (appSettings?.isPro && currentContent.includes('{{NOMOR_SURAT_OTOMATIS}}')) {
            toast({
                variant: 'destructive',
                title: 'Gagal Berbagi: Fitur Pro Digunakan',
                description: 'Hapus placeholder {{NOMOR_SURAT_OTOMATIS}} untuk dapat membagikan link ini karena Mode Pro sedang aktif.',
                duration: 7000,
            });
            return;
        }

        const dataToEncode = {
            template: currentContent,
            fields: template.fields,
            isPro: appSettings?.isPro || false
        };
        const encodedData = btoa(encodeURIComponent(JSON.stringify(dataToEncode)));
        const url = `${window.location.origin}/surat/share?data=${encodedData}`;

        navigator.clipboard.writeText(url);
        toast({ title: 'Link Disalin!', description: 'Link surat telah disalin ke clipboard.' });
    }
    
    const handlePreview = () => {
        if (!template) return;
        const currentContent = editorRef.current?.innerHTML || content;
        const dataToEncode = {
            template: currentContent,
            fields: template.fields,
            isPro: appSettings?.isPro || false
        };
        const encodedData = btoa(encodeURIComponent(JSON.stringify(dataToEncode)));
        const url = `/surat/share?data=${encodedData}`;
        window.open(url, '_blank');
    }
  
    if (!template) {
         return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
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
            
            <AlertDialog open={isPosterAdOpen} onOpenChange={setIsPosterAdOpen}>
                 <AlertDialogContent className="p-0 border-0 max-w-xs w-full overflow-hidden">
                    {appSettings?.ads.poster.type === 'manual' ? (
                       <Image src={appSettings.ads.poster.value} alt="Iklan Poster" width={300} height={400} className="w-full h-auto" />
                    ) : (
                       <div>{/* Placeholder for ad platform code */}</div>
                    )}
                 </AlertDialogContent>
            </AlertDialog>


            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 order-2 lg:order-1">
                     <Card className="shadow-lg h-full">
                        <CardHeader className='flex-row items-center justify-between'>
                            <div>
                                <CardTitle className="flex items-center gap-3">Editor Template</CardTitle>
                                <Input value={template.title} onChange={(e) => setTemplate({ ...template, title: e.target.value })} className="text-sm text-muted-foreground border-0 p-0 h-auto focus-visible:ring-0" />
                            </div>
                             <Button variant="ghost" size="icon" onClick={() => {
                                if (editorRef.current) {
                                  editorRef.current.innerHTML = '';
                                  handleContentUpdate();
                                }
                             }}>
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
                                onBlur={handleContentUpdate}
                                className="min-h-[500px] w-full rounded-b-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm whitespace-pre-wrap font-serif"
                                dangerouslySetInnerHTML={{ __html: content }}
                                suppressContentEditableWarning={true}
                             />
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 order-1 lg:order-2 space-y-6">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3"><FileSignature className="w-6 h-6 text-primary" />Aksi & Opsi</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                             <Button onClick={handleSaveTemplate} className="w-full"><Save className="mr-2 h-4 w-4" /> Simpan Template</Button>
                             <Button onClick={handleShare} className="w-full" variant="secondary"><Share2 className="mr-2 h-4 w-4" /> Salin Link</Button>
                            <Button onClick={handlePreview} className="w-full" variant="secondary"><Eye className="mr-2 h-4 w-4" /> Pratinjau & Isi</Button>
                        </CardContent>
                    </Card>
                    
                    {appSettings?.ads.banner.enabled && (
                        <AdBanner settings={appSettings.ads.banner} isMobile={isMobile}/>
                    )}

                    <Card className="shadow-lg">
                        <CardHeader>
                             <CardTitle className="text-xl">Opsi Template</CardTitle>
                        </CardHeader>
                         <CardContent className="space-y-4">
                             <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg text-center">
                                 <UploadCloud className="w-10 h-10 text-muted-foreground mb-2"/>
                                 <Label htmlFor="template-file" className="text-primary font-semibold cursor-pointer hover:underline">Unggah Template .docx</Label>
                                 <Input id="template-file" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleDocxUpload} className="hidden"/>
                             </div>
                             <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg text-center">
                                <ImageIcon className="w-10 h-10 text-muted-foreground mb-2"/>
                                <Label htmlFor="image-file" className="text-primary font-semibold cursor-pointer hover:underline">Tambah Kop Surat</Label>
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
                                <Button variant="outline" className="flex-grow justify-start w-full" onClick={() => insertPlaceholder('NOMOR_SURAT_OTOMATIS')}>
                                    <Hash className="mr-2 h-4 w-4 text-primary" />
                                    Nomor Surat Otomatis
                                    {appSettings?.isPro && <Crown className="ml-auto h-4 w-4 text-primary" />}
                                </Button>
                                {template.fields.map(field => (
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
