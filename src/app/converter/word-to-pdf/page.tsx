
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileCode2, FileText, ArrowRightLeft } from 'lucide-react';
import { saveAs } from 'file-saver';
import { convertWordToPdf } from '@/ai/flows/file-converter';

export default function WordToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || selectedFile.name.endsWith('.docx'))) {
      setFile(selectedFile);
    } else {
      toast({
        variant: 'destructive',
        title: 'File Tidak Valid',
        description: 'Silakan pilih file dengan format .docx.',
      });
    }
  };

  const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'Tidak ada file',
        description: 'Silakan pilih file .docx untuk dikonversi.',
      });
      return;
    }

    setIsConverting(true);

    try {
      const dataUri = await toBase64(file);
      const result = await convertWordToPdf({ fileDataUri: dataUri, filename: file.name });
      
      if (result.error) {
        throw new Error(result.error);
      }

      if(result.fileDataUri){
        saveAs(result.fileDataUri, getTargetFilename());
         toast({
          title: 'Konversi Berhasil',
          description: 'File Word Anda telah dikonversi menjadi PDF.',
        });
      } else {
        throw new Error('Konversi gagal: tidak ada file yang diterima.');
      }

    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak dikenal.';
      toast({
        variant: 'destructive',
        title: 'Kesalahan Konversi',
        description: errorMessage,
      });
    } finally {
      setIsConverting(false);
    }
  };

  const getTargetFilename = () => {
    if (!file) return 'converted.pdf';
    const originalName = file.name.substring(0, file.name.lastIndexOf('.'));
    return `${originalName}.pdf`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
           <div className="flex justify-center items-center gap-4 mb-4">
            <FileCode2 className="w-12 h-12 text-blue-500" />
            <ArrowRightLeft className="w-8 h-8 text-muted-foreground" />
            <FileText className="w-12 h-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-headline">Word ke PDF</CardTitle>
          <CardDescription>Unggah file .docx Anda untuk diubah menjadi dokumen PDF.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Pilih File .docx</Label>
              <Input id="file-upload" type="file" accept=".docx" onChange={handleFileChange} />
              {file && <p className="text-sm text-muted-foreground">File dipilih: {file.name}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isConverting || !file}>
              {isConverting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengonversi...
                </>
              ) : (
                'Konversi ke PDF & Unduh'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
