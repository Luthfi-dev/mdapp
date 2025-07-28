
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, FileCode2, ArrowRightLeft } from 'lucide-react';
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
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setShowPreview(false);
      if (previewRef.current) previewRef.current.innerHTML = '';
    } else {
      toast({
        variant: 'destructive',
        title: 'File Tidak Valid',
        description: 'Silakan pilih file dengan format PDF.',
      });
      setFile(null);
      setShowPreview(false);
      if (previewRef.current) previewRef.current.innerHTML = '';
    }
  };

  const renderPdf = async (fileToRender: File) => {
    const fileReader = new FileReader();
    fileReader.onload = async function() {
        if (!previewRef.current) return;
        previewRef.current.innerHTML = ''; // Clear previous preview
        
        const typedarray = new Uint8Array(this.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: context!,
                viewport: viewport
            };

            const pageDiv = document.createElement('div');
            pageDiv.className = 'pdf-page-preview';
            pageDiv.style.margin = '10px 0';
            pageDiv.style.border = '1px solid #ddd';
            pageDiv.style.position = 'relative';
            pageDiv.style.width = `${viewport.width}px`;
            pageDiv.style.height = `${viewport.height}px`;

            pageDiv.appendChild(canvas);
            
            await page.render(renderContext).promise;

            const textContent = await page.getTextContent();
            const textLayerDiv = document.createElement("div");
            textLayerDiv.className = "textLayer";
            textLayerDiv.style.position = 'absolute';
            textLayerDiv.style.left = '0';
            textLayerDiv.style.top = '0';
            textLayerDiv.style.height = '100%';
            textLayerDiv.style.width = '100%';
            textLayerDiv.style.opacity = '0.5'; // For debugging visibility

            textContent.items.forEach((item: any) => {
                const tx = pdfjsLib.Util.transform(
                    viewport.transform,
                    item.transform
                );

                const style = textContent.styles[item.fontName];
                const textDiv = document.createElement('span');
                textDiv.style.fontFamily = style?.fontFamily || 'sans-serif';
                textDiv.style.transformOrigin = '0% 0%';
                textDiv.style.transform = `matrix(${tx[0]}, ${tx[1]}, ${tx[2]}, ${tx[3]}, ${tx[4]}, ${tx[5]}) scaleY(-1)`;
                textDiv.style.fontSize = `${Math.sqrt((tx[2] * tx[2]) + (tx[3] * tx[3]))}px`;
                textDiv.style.position = 'absolute';
                textDiv.style.whiteSpace = 'pre';
                textDiv.textContent = item.str;
                textLayerDiv.appendChild(textDiv);
            });
            
            pageDiv.appendChild(textLayerDiv);
            previewRef.current?.appendChild(pageDiv);
        }
        setShowPreview(true);
    };
    fileReader.readAsArrayBuffer(fileToRender);
  };
  
  const getTargetFilename = () => {
    if (!file) return 'converted.docx';
    const originalName = file.name.substring(0, file.name.lastIndexOf('.'));
    return `${originalName}.docx`;
  };

  const handleConvertToWord = async () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'Tidak Ada File',
        description: 'Silakan unggah file PDF terlebih dahulu.',
      });
      return;
    }

    setIsConverting(true);

    try {
        const fileReader = new FileReader();
        fileReader.onload = async function() {
            const typedarray = new Uint8Array(this.result as ArrayBuffer);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            
            let fullHtmlContent = '<html><body>';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                textContent.items.forEach((item: any) => {
                    fullHtmlContent += `<p>${item.str}</p>`;
                });
                fullHtmlContent += '<br style="page-break-after: always;"/>';
            }
            fullHtmlContent += '</body></html>';

            const result = await convertHtmlToWord({
                htmlContent: fullHtmlContent,
                filename: getTargetFilename(),
            });

            if (result.error || !result.docxDataUri) {
                throw new Error(result.error || 'Konversi di server gagal.');
            }

            saveAs(result.docxDataUri, getTargetFilename());

            toast({
                title: 'Konversi Berhasil',
                description: 'File PDF Anda telah berhasil dikonversi dan diunduh.',
            });
            setIsConverting(false);
        };
        fileReader.readAsArrayBuffer(file);

    } catch (error) {
      console.error("Word Conversion Error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak dikenal.';
      toast({
        variant: 'destructive',
        title: 'Kesalahan Konversi',
        description: `Gagal mengonversi file: ${errorMessage}`,
      });
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
          <CardTitle className="text-2xl font-headline">PDF ke Word (Pratinjau HTML)</CardTitle>
          <CardDescription>Unggah file PDF Anda, pratinjau sebagai HTML, dan konversi ke Word.</CardDescription>
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
                            <Button onClick={handleConvertToWord} className="w-full" disabled={isConverting}>
                            {isConverting ? (
                                <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Mengonversi...
                                </>
                            ) : (
                                'Konversi & Unduh Otomatis'
                            )}
                            </Button>
                            <Button variant="outline" onClick={() => renderPdf(file)} disabled={isConverting}>
                                Lihat Pratinjau
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
