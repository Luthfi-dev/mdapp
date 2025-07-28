
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, FileCode2, ArrowRightLeft, Eye, Download } from 'lucide-react';
import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist';
import { convertHtmlToWord } from '@/ai/flows/file-converter';

// Set worker source
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export default function PdfToWordPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfTextContent, setPdfTextContent] = useState<string[]>([]);
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null);

  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

  const resetState = () => {
    setFile(null);
    setShowPreview(false);
    setPdfTextContent([]);
    setConvertedFileUrl(null);
    if (previewRef.current) previewRef.current.innerHTML = '';
  }
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    resetState();
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const typedarray = new Uint8Array(arrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        const allPagesText: string[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          allPagesText.push(pageText);
        }
        setPdfTextContent(allPagesText);

      } catch (error) {
         toast({
          variant: 'destructive',
          title: 'Gagal Memproses PDF',
          description: 'File PDF mungkin rusak atau tidak dapat dibaca.',
        });
        resetState();
      }
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
    if (!file || !previewRef.current) return;
    
    setShowPreview(true);
    previewRef.current.innerHTML = '<div class="flex justify-center items-center h-full"><div class="loader"></div></div>'; // Loading indicator
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const typedarray = new Uint8Array(arrayBuffer);
      const pdf = await pdfjsLib.getDocument(typedarray).promise;

      previewRef.current.innerHTML = ''; // Clear loading indicator

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.style.marginBottom = '10px';
        
        previewRef.current?.appendChild(canvas);

        await page.render({ canvasContext: context!, viewport: viewport }).promise;
      }
    } catch (error) {
       previewRef.current.innerHTML = '<p class="text-destructive">Gagal mempratinjau PDF.</p>';
       console.error("PDF Preview Error:", error);
    }
  };
  
  const getTargetFilename = () => {
    if (!file) return 'converted.docx';
    const originalName = file.name.substring(0, file.name.lastIndexOf('.'));
    return `${originalName}.docx`;
  };

  const handleConvertToWord = async () => {
    if (!file || pdfTextContent.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Tidak Ada Konten',
        description: 'Silakan unggah dan proses file PDF terlebih dahulu.',
      });
      return;
    }

    setIsConverting(true);
    setConvertedFileUrl(null);

    try {
        let fullHtmlContent = '<html><body>';
        pdfTextContent.forEach(pageText => {
            const paragraphs = pageText.split(/\s{2,}/) // Split on 2+ spaces
                .filter(p => p.trim())
                .map(p => `<p>${p.trim()}</p>`)
                .join('');
            fullHtmlContent += `<div style="page-break-after: always;">${paragraphs}</div>`;
        });
        fullHtmlContent += '</body></html>';

        const result = await convertHtmlToWord({
            htmlContent: fullHtmlContent,
            filename: getTargetFilename(),
        });

        if (result.error || !result.docxDataUri) {
            throw new Error(result.error || 'Konversi di server gagal.');
        }

        setConvertedFileUrl(result.docxDataUri);

        toast({
            title: 'Konversi Berhasil',
            description: 'File Anda siap diunduh.',
        });

    } catch (error) {
      console.error("Word Conversion Error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak dikenal.';
      toast({
        variant: 'destructive',
        title: 'Kesalahan Konversi',
        description: `Gagal mengonversi file: ${errorMessage}`,
      });
    } finally {
        setIsConverting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-4 mb-4">
            <FileText className="w-12 h-12 text-red-500" />
            <ArrowRightLeft className="w-8 h-8 text-muted-foreground" />
            <FileCode2 className="w-12 h-12 text-blue-500" />
          </div>
          <CardTitle className="text-2xl font-headline">PDF ke Word (Ekstrak Teks)</CardTitle>
          <CardDescription>Unggah file PDF Anda, pratinjau, dan konversi ke Word.</CardDescription>
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
                          {!convertedFileUrl ? (
                              <Button onClick={handleConvertToWord} className="w-full" disabled={isConverting || !file}>
                                {isConverting ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Mengonversi...
                                    </>
                                ) : (
                                    'Konversi ke Word'
                                )}
                              </Button>
                          ) : (
                              <Button onClick={() => saveAs(convertedFileUrl, getTargetFilename())} className="w-full" variant="secondary">
                                <Download className="mr-2 h-4 w-4" />
                                Unduh File Word
                              </Button>
                          )}
                           <Button variant="outline" size="icon" onClick={renderPdfPreview} disabled={isConverting || !file}>
                              <Eye className="h-5 w-5" />
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
                <p>Pratinjau dirender di browser, konversi dilakukan di server. Tidak ada data yang disimpan.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
