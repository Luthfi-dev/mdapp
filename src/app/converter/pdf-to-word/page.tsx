
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, Eye } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export default function PdfViewerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

  const resetState = () => {
    setFile(null);
    setShowPreview(false);
    if (previewRef.current) previewRef.current.innerHTML = '';
  }
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    resetState();
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else if (selectedFile) {
      toast({
        variant: 'destructive',
        title: 'File Tidak Valid',
        description: 'Silakan pilih file dengan format PDF.',
      });
      resetState();
    }
  };

  const renderPdfPreview = async () => {
    if (!file) return;
    
    setShowPreview(true);
    setIsLoading(true);

    if (previewRef.current) previewRef.current.innerHTML = ''; // Clear previous preview
    
    try {
        const arrayBuffer = await file.arrayBuffer();
        const typedarray = new Uint8Array(arrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;

        for (let i = 0; i < pdf.numPages; i++) {
            const page = await pdf.getPage(i + 1);
            const viewport = page.getViewport({ scale: 1.5 });

            const canvas = document.createElement('canvas');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.style.marginBottom = '10px';
            previewRef.current?.appendChild(canvas);
            
            const context = canvas.getContext('2d');
            if (context) {
              await page.render({ canvasContext: context, viewport: viewport }).promise;
            }
        }
    } catch (error) {
       if (previewRef.current) previewRef.current.innerHTML = '<p class="text-destructive">Gagal mempratinjau PDF.</p>';
       console.error("PDF Preview Error:", error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-4 mb-4">
            <FileText className="w-12 h-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-headline">Penampil PDF</CardTitle>
          <CardDescription>Unggah dan lihat pratinjau file PDF Anda langsung di browser.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="file-upload">Pilih File PDF</Label>
                    <Input id="file-upload" type="file" accept=".pdf" onChange={handleFileChange} />
                    {file && <p className="text-sm text-muted-foreground">File dipilih: {file.name}</p>}
                </div>

                {file && (
                  <div className="space-y-4">
                      <div className="flex gap-2">
                           <Button className="w-full" variant="outline" onClick={renderPdfPreview} disabled={isLoading || !file}>
                              {isLoading ? (
                                  <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Memuat Pratinjau...
                                  </>
                              ) : (
                                  <>
                                    <Eye className="mr-2 h-5 w-5" />
                                    Lihat Pratinjau
                                  </>
                              )}
                           </Button>
                      </div>
                      
                      {showPreview && (
                          <div className="border rounded-md p-4 bg-secondary word-preview-container">
                              <h4 className="font-bold mb-2 text-center">Pratinjau Dokumen</h4>
                              <div ref={previewRef} className="bg-white p-2 shadow-inner h-96 overflow-auto"></div>
                          </div>
                      )}
                  </div>
                )}
            </div>
            <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>Pratinjau dirender di browser. Tidak ada data yang disimpan di server.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
