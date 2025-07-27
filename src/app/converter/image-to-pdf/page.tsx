'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2, FileImage, FileText, ArrowRightLeft, X } from 'lucide-react';
import { PDFDocument, PDFImage } from 'pdf-lib';
import Image from 'next/image';

interface UploadedImage {
  file: File;
  url: string;
}

export default function ImageToPdfPage() {
  const [files, setFiles] = useState<UploadedImage[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const newImages = Array.from(selectedFiles)
        .filter(file => file.type.startsWith('image/'))
        .map(file => ({
          file,
          url: URL.createObjectURL(file),
        }));
      
      if (newImages.length > 0) {
        setFiles(prev => [...prev, ...newImages]);
      } else {
        toast({
          variant: 'destructive',
          title: 'File Tidak Valid',
          description: 'Silakan pilih file dengan format gambar (JPG, PNG, dll).',
        });
      }
    }
  };

  const removeImage = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Tidak ada file',
        description: 'Silakan pilih setidaknya satu gambar untuk dikonversi.',
      });
      return;
    }

    setIsConverting(true);
    setConvertedFileUrl(null);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const { file } of files) {
        const arrayBuffer = await file.arrayBuffer();
        let pdfImage: PDFImage;

        if (file.type === 'image/png') {
            pdfImage = await pdfDoc.embedPng(arrayBuffer);
        } else if (file.type === 'image/jpeg') {
            pdfImage = await pdfDoc.embedJpg(arrayBuffer);
        } else {
            // Basic fallback for other image types - might not work for all
            const image = new Image();
            image.src = URL.createObjectURL(file);
            await new Promise(resolve => image.onload = resolve);
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(image, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg');
            pdfImage = await pdfDoc.embedJpg(dataUrl);
        }
        
        const page = pdfDoc.addPage([pdfImage.width, pdfImage.height]);
        page.drawImage(pdfImage, {
          x: 0,
          y: 0,
          width: pdfImage.width,
          height: pdfImage.height,
        });
      }
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setConvertedFileUrl(url);

      toast({
        title: 'Konversi Berhasil',
        description: `${files.length} gambar telah berhasil dikonversi menjadi PDF.`,
      });

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

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
           <div className="flex justify-center items-center gap-4 mb-4">
            <FileImage className="w-12 h-12 text-green-500" />
            <ArrowRightLeft className="w-8 h-8 text-muted-foreground" />
            <FileText className="w-12 h-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-headline">Gambar ke PDF</CardTitle>
          <CardDescription>Unggah satu atau lebih gambar untuk digabungkan menjadi satu file PDF.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label>File Gambar</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                 <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                   Pilih Gambar
                 </Button>
                 <Input ref={fileInputRef} id="file-upload" type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden"/>
                 <p className="text-xs text-muted-foreground mt-2">Anda dapat memilih beberapa file sekaligus.</p>
              </div>
              
              {files.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Pratinjau Gambar:</h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {files.map((img, index) => (
                      <div key={index} className="relative group aspect-square">
                        <Image src={img.url} alt={`Preview ${index}`} layout="fill" objectFit="cover" className="rounded-md" />
                         <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isConverting || files.length === 0}>
              {isConverting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengonversi...
                </>
              ) : (
                'Konversi ke PDF'
              )}
            </Button>
          </form>

          {convertedFileUrl && (
             <div className="mt-8 border-t pt-6 space-y-4">
                <h3 className="text-lg font-medium text-primary text-center">Konversi Selesai!</h3>
                <div className="text-center">
                    <Button asChild>
                        <a href={convertedFileUrl} download="converted_images.pdf">
                        <Download className="mr-2 h-4 w-4" />
                        Unduh File PDF
                        </a>
                    </Button>
                </div>
                <div className="w-full aspect-[4/5] bg-secondary rounded-md">
                     <iframe src={convertedFileUrl} className="w-full h-full border-none" title="PDF Preview"/>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}