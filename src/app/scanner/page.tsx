
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
  RotateCcw
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';

interface ScannedItem {
  id: number;
  data: string;
}

export default function ScannerPage() {
  const [scannedHistory, setScannedHistory] = useState<ScannedItem[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isAutoScan, setIsAutoScan] = useState(true);
  
  const { toast } = useToast();
  const scannerRef = useRef<QrScanner>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    navigator.mediaDevices?.getUserMedia({ video: true })
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false));
  }, []);
  
  const handleScanResult = (result: any) => {
    if (result) {
      const newScan: ScannedItem = {
        id: Date.now(),
        data: result.text,
      };
      setScannedHistory(prev => [newScan, ...prev]);
      setIsScanning(false);
      toast({
        title: 'Scan Successful',
        description: 'Data added to history.',
      });

      if (isAutoScan) {
        setTimeout(() => setIsScanning(true), 2000);
      }
    }
  };

  const handleError = (error: any) => {
    if (error.name === 'NotAllowedError') {
      setHasPermission(false);
    } else {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Scan Error',
        description: 'An unexpected error occurred while scanning.',
      });
    }
  }
  
  const copyToClipboard = (text: string, singleItem: boolean = false) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to Clipboard!',
      description: singleItem ? 'Scanned data copied.' : 'All scanned data copied.',
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
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  const toggleFlash = async () => {
     if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        if (capabilities.torch) {
            try {
                await track.applyConstraints({
                    advanced: [{ torch: !isFlashOn }]
                });
                setIsFlashOn(!isFlashOn);
            } catch (error) {
                console.error("Failed to toggle flash:", error);
                toast({ variant: "destructive", title: "Flash Error", description: "Could not toggle the flash."});
            }
        } else {
            toast({ title: "Flash Not Supported", description: "This device does not support flash control."});
        }
    }
  }

  if (!hasPermission) {
      return (
        <div className="container mx-auto px-4 py-8">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">QR/Barcode Scanner</CardTitle>
                    <CardDescription>Point your camera at a code to scan it.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <Camera className="h-4 w-4" />
                        <AlertTitle>Camera Permission Required</AlertTitle>
                        <AlertDescription>
                            Please grant camera access in your browser settings to use the scanner. Then, refresh the page.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </div>
      )
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <Card className="max-w-2xl mx-auto overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">QR/Barcode Scanner</CardTitle>
          <CardDescription>Point your camera at a code to scan it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative w-full aspect-square bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
             {isScanning ? (
                <>
                    <QrScanner
                        ref={scannerRef}
                        delay={300}
                        onError={handleError}
                        onScan={handleScanResult}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        constraints={{ video: { facingMode } }}
                        onLoad={(...args: any[]) => {
                            if (args[0]?.target) {
                                videoRef.current = args[0].target;
                            }
                        }}
                    />
                    <div className="absolute inset-0 bg-transparent pointer-events-none">
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-auto">
                            <div className="flex items-center gap-2 rounded-full bg-black/50 p-2">
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white hover:bg-white/20 hover:text-white" onClick={toggleFlash}>
                                    {isFlashOn ? <ZapOff /> : <Zap />}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white hover:bg-white/20 hover:text-white" onClick={toggleFacingMode}>
                                    <SwitchCamera />
                                </Button>
                            </div>
                             <Dialog>
                                <DialogTrigger asChild>
                                     <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white bg-black/50 hover:bg-white/20 hover:text-white pointer-events-auto">
                                        <HelpCircle />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-sm rounded-2xl shadow-2xl">
                                    <DialogHeader>
                                    <DialogTitle className="text-xl text-center font-bold">How to Use Scanner</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 text-sm text-muted-foreground pt-2">
                                        <p className="flex items-start gap-3"><Camera className="w-5 h-5 text-primary shrink-0 mt-0.5"/> <span>Point your camera at a QR or Barcode. The scan will happen automatically.</span></p>
                                        <p className="flex items-start gap-3"><Zap className="w-5 h-5 text-primary shrink-0 mt-0.5"/><span>Use the flash icon to toggle your device's flashlight in dark conditions.</span></p>
                                        <p className="flex items-start gap-3"><SwitchCamera className="w-5 h-5 text-primary shrink-0 mt-0.5"/><span>Use the camera switch icon to flip between front and rear cameras.</span></p>
                                        <p className="flex items-start gap-3"><Power className="w-5 h-5 text-primary shrink-0 mt-0.5"/><span>Enable 'Auto Scan' to automatically start a new scan 2 seconds after a successful one.</span></p>
                                    </div>
                                    <DialogClose asChild>
                                       <Button type="button" variant="ghost" size="icon" className="absolute right-4 top-4 rounded-full h-8 w-8">
                                          <X className="h-4 w-4" />
                                          <span className="sr-only">Close</span>
                                      </Button>
                                    </DialogClose>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center text-center p-4 text-white">
                    <ClipboardCheck className="w-16 h-16 text-green-400 mb-4" />
                    <h3 className="text-xl font-bold">Scan Complete!</h3>
                    <p className="text-gray-300 mb-6">Your result has been added to the history below.</p>
                    <Button onClick={() => setIsScanning(true)}>
                       <RotateCcw className="mr-2"/> Start New Scan
                    </Button>
                </div>
             )}
          </div>
          
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Scan History</h3>
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
              <p className="text-muted-foreground text-center text-sm py-4">No scans yet. Point the camera at a code to begin.</p>
            )}
          </div>
          
           {scannedHistory.length > 0 && (
                <Button onClick={copyAll} className="w-full">
                    Copy All ({scannedHistory.length})
                </Button>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
