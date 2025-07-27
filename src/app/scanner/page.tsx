
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import QrScanner from 'react-qr-scanner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Camera, 
  Copy, 
  Trash2, 
  Zap, 
  ZapOff, 
  SwitchCamera,
  HelpCircle,
  X,
  ClipboardCheck,
  Power,
  RotateCcw,
  QrCode,
  Barcode,
  ZoomIn
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';


interface ScannedItem {
  id: number;
  data: string;
}

export default function ScannerPage() {
  const [scannedHistory, setScannedHistory] = useState<ScannedItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isAutoScan, setIsAutoScan] = useState(true);
  
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Safely load history from localStorage only on the client, after the component has mounted.
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('scannedHistory');
      if (storedHistory) {
        setScannedHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
      setScannedHistory([]); // Reset to empty array on error
    }
  }, []);

  // Save to localStorage whenever history changes.
  useEffect(() => {
    localStorage.setItem('scannedHistory', JSON.stringify(scannedHistory));
  }, [scannedHistory]);

  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        setHasPermission(true);
        setIsScanning(true);
      } catch (err) {
        console.error("Camera permission error:", err);
        setHasPermission(false);
      }
    };
    requestCameraPermission();
  }, []);


  const handleScanResult = (result: any) => {
    if (result && result.text) {
      const newScan: ScannedItem = {
        id: Date.now(),
        data: result.text,
      };
      
      if (!scannedHistory.some(item => item.data === newScan.data)) {
        setScannedHistory(prev => [newScan, ...prev]);
        
        toast({
          title: 'Pemindaian Berhasil',
          description: 'Data telah ditambahkan ke riwayat.',
        });

        if (!isAutoScan) {
          setIsScanning(false);
        } else {
            // Restart scanning after a delay for auto-scan mode
            setTimeout(() => setIsScanning(true), 2000);
        }
      }
    }
  };

  const handleError = (error: any) => {
    console.error('QR Scanner Error:', error);
    if (hasPermission === false) {
       toast({
          variant: 'destructive',
          title: 'Izin Kamera Diperlukan',
          description: 'Harap berikan izin kamera di pengaturan browser.',
        });
    } else {
        toast({
          variant: 'destructive',
          title: 'Gagal Memulai Kamera',
          description: 'Pastikan tidak digunakan aplikasi lain dan coba lagi.',
        });
        setIsScanning(false); 
    }
  }
  
  const copyToClipboard = (text: string, singleItem: boolean = false) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Berhasil Disalin!',
      description: singleItem ? 'Data pindaian disalin ke clipboard.' : 'Semua data pindaian disalin ke clipboard.',
    });
  };

  const deleteItem = (id: number) => {
    setScannedHistory(prev => prev.filter(item => item.id !== id));
  };
  
  const copyAll = () => {
    if (scannedHistory.length === 0) return;
    const allData = scannedHistory.map(item => item.data).join(', ');
    copyToClipboard(allData, false);
  }

  const toggleFacingMode = () => {
    if (isFlashOn) {
        toggleFlash();
    }
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  const toggleFlash = async () => {
     if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const track = stream.getVideoTracks()[0];
        if (track && track.getCapabilities().torch) {
            try {
                await track.applyConstraints({ advanced: [{ torch: !isFlashOn }] });
                setIsFlashOn(!isFlashOn);
            } catch (error) {
                console.error("Gagal menyalakan flash:", error);
                toast({ variant: "destructive", title: "Flash Error", description: "Tidak dapat mengaktifkan flash."});
            }
        } else {
            toast({ title: "Flash Tidak Didukung", description: "Perangkat ini tidak mendukung kontrol flash."});
        }
    }
  }

  const handleZoom = (value: number[]) => {
      if(videoRef.current && videoRef.current.srcObject) {
         const stream = videoRef.current.srcObject as MediaStream;
         const track = stream.getVideoTracks()[0];
         const capabilities = track.getCapabilities();
         if ('zoom' in capabilities && capabilities.zoom) {
            track.applyConstraints({ advanced: [{ zoom: value[0] }] });
         } else {
             console.warn("Zoom is not supported by this device's camera.");
         }
      }
  }
  
  const renderScanner = () => {
    if (hasPermission === null) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-4 text-white bg-gray-900 h-full">
          <Camera className="w-16 h-16 text-gray-400 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold">Meminta Izin Kamera...</h3>
        </div>
      );
    }

    if (hasPermission === false) {
      return (
         <div className="p-4 h-full flex items-center justify-center">
            <Alert variant="destructive">
                <Camera className="h-4 w-4" />
                <AlertTitle>Izin Kamera Diperlukan</AlertTitle>
                <AlertDescription>
                    Harap berikan izin akses kamera di pengaturan browser Anda untuk menggunakan pemindai. Kemudian, segarkan halaman.
                </AlertDescription>
            </Alert>
         </div>
      );
    }
    
    if (isScanning) {
       return (
          <>
              <QrScanner
                  onScan={handleScanResult}
                  onError={handleError}
                  constraints={{ 
                      video: { 
                          facingMode,
                          focusMode: 'continuous',
                      } 
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className="absolute inset-0 bg-transparent pointer-events-none">
                <div className="absolute inset-0 border-[20px] border-black/30 shadow-[0_0_0_2000px_rgba(0,0,0,0.3)] rounded-2xl" />
                <div className="absolute w-2/3 max-w-[300px] aspect-square top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                   <div className="w-full h-full border-4 border-white/80 rounded-2xl animate-pulse" />
                </div>
                 
                 <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-auto">
                    <div className="flex items-center gap-2">
                         <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white bg-black/50 hover:bg-white/20 hover:text-white" onClick={toggleFlash}>
                              {isFlashOn ? <ZapOff /> : <Zap />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white bg-black/50 hover:bg-white/20 hover:text-white" onClick={toggleFacingMode}>
                              <SwitchCamera />
                          </Button>
                    </div>
                 </div>
              </div>
          </>
      )
    } else {
        return (
            <div className="flex flex-col items-center justify-center text-center p-4 text-white bg-gray-900 h-full">
                <ClipboardCheck className="w-16 h-16 text-green-400 mb-4" />
                <h3 className="text-xl font-bold">Pindai Selesai!</h3>
                <p className="text-gray-300 mb-6">Hasil pindaian Anda telah ditambahkan ke riwayat di bawah.</p>
                <Button onClick={() => setIsScanning(true)}>
                   <RotateCcw className="mr-2"/> Mulai Pindai Baru
                </Button>
            </div>
        );
    }
  }


  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <Card className="max-w-2xl mx-auto overflow-hidden shadow-xl rounded-2xl">
        <CardHeader>
            <CardTitle className="text-2xl font-headline">Pemindai Cerdas</CardTitle>
            <CardDescription>Arahkan kamera ke kode untuk memindai.</CardDescription>
             <Dialog>
              <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mt-4">
                    <HelpCircle className="mr-2"/> Cara Penggunaan
                  </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md rounded-2xl shadow-2xl">
                  <DialogHeader>
                  <DialogTitle className="text-xl text-center font-bold">Panduan Penggunaan Pemindai</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 text-sm text-muted-foreground pt-2">
                      <p className="flex items-start gap-3"><Camera className="w-6 h-6 text-primary shrink-0 mt-0.5"/> <span>Arahkan kamera Anda ke QR Code atau Barcode. Pemindaian akan terjadi secara otomatis ketika kode terdeteksi dengan jelas.</span></p>
                      <p className="flex items-start gap-3"><ZoomIn className="w-6 h-6 text-primary shrink-0 mt-0.5"/><span>Gunakan **slider zoom** untuk memperbesar atau memperkecil tampilan jika kode terlalu kecil atau jauh.</span></p>
                      <p className="flex items-start gap-3"><Zap className="w-6 h-6 text-primary shrink-0 mt-0.5"/><span>Gunakan ikon **Flash** untuk menyalakan lampu senter perangkat dalam kondisi gelap agar pemindaian lebih mudah.</span></p>
                      <p className="flex items-start gap-3"><SwitchCamera className="w-6 h-6 text-primary shrink-0 mt-0.5"/><span>Gunakan ikon **Ganti Kamera** untuk beralih antara kamera depan dan belakang sesuai kebutuhan Anda.</span></p>
                      <p className="flex items-start gap-3"><Power className="w-6 h-6 text-primary shrink-0 mt-0.5"/><span>Aktifkan **'Auto Scan'** untuk memulai pemindaian baru secara otomatis setelah pemindaian sebelumnya berhasil. Sangat efisien untuk memindai banyak kode secara berurutan.</span></p>
                      <p className="flex items-start gap-3"><Copy className="w-6 h-6 text-primary shrink-0 mt-0.5"/><span>Setiap hasil pindaian akan muncul di riwayat. Anda dapat **menyalin** satu per satu atau **menyalin semua** hasil sekaligus dengan pemisah koma.</span></p>
                  </div>
                  <DialogClose asChild>
                      <Button type="button" variant="ghost" size="icon" className="absolute right-4 top-4 rounded-full h-8 w-8">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Tutup</span>
                    </Button>
                  </DialogClose>
              </DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative w-full aspect-square bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
             {renderScanner()}
          </div>

          <div className='space-y-2'>
              <Label htmlFor="zoom-slider">Zoom</Label>
              <Slider 
                id="zoom-slider"
                defaultValue={[1]} 
                min={1} 
                max={5} 
                step={0.1} 
                onValueChange={handleZoom}
                disabled={!isScanning || hasPermission !== true}
              />
          </div>
          
           <div className="flex items-center justify-center gap-4">
              <Button variant="outline" className="flex-1">
                <Barcode className="mr-2"/> Barcode
              </Button>
               <Button variant="outline" className="flex-1">
                <QrCode className="mr-2"/> QR Code
              </Button>
            </div>

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Riwayat Pindaian</h3>
            <div className="flex items-center space-x-2">
                <Switch id="auto-scan-mode" checked={isAutoScan} onCheckedChange={setIsAutoScan} />
                <Label htmlFor="auto-scan-mode">Auto Scan</Label>
            </div>
          </div>
          
           <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
            {scannedHistory.length > 0 ? (
              scannedHistory.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-secondary p-3 rounded-lg">
                  <p className="truncate text-sm flex-1 mr-4">{item.data}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(item.data, true)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center text-sm py-4">Belum ada pindaian. Arahkan kamera ke kode untuk memulai.</p>
            )}
          </div>
          
           {scannedHistory.length > 0 && (
                <Button onClick={copyAll} className="w-full">
                    Salin Semua ({scannedHistory.length})
                </Button>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
