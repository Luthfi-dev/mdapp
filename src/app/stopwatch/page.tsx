
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Pause, RotateCcw, Flag, ArrowUp, ArrowDown, Expand, Minimize, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function StopwatchPage() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isFullScreen, setIsFullScreen] = useState(false);
  const stopwatchRef = useRef<HTMLDivElement>(null);

  const handleFullScreenChange = useCallback(() => {
    setIsFullScreen(!!document.fullscreenElement);
  }, []);

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, [handleFullScreenChange]);

  const handleFullScreenToggle = () => {
    if (!stopwatchRef.current) return;
    if (!document.fullscreenElement) {
      stopwatchRef.current.requestFullscreen().catch(err => {
        alert(`Gagal mengaktifkan mode layar penuh: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const startTimer = useCallback(() => {
    setIsRunning(true);
    const startTime = Date.now() - time;
    timerRef.current = setInterval(() => {
      setTime(Date.now() - startTime);
    }, 10);
  }, [time]);
  
  const stopTimer = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  const handleLap = () => {
    if (isRunning) {
      const currentLapTime = time - laps.reduce((a, b) => a + b, 0);
      setLaps(prevLaps => [currentLapTime, ...prevLaps]);
    }
  };

  const handleReset = () => {
    stopTimer();
    setTime(0);
    setLaps([]);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    const milliseconds = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
    return `${minutes}:${seconds}.${milliseconds}`;
  };
  
  const formatTotalLapsTime = (laps: number[]) => {
      const totalMs = laps.reduce((a, b) => a + b, 0);
      return formatTime(totalMs);
  }

  const getLapStats = () => {
    if (laps.length < 2) return { fastest: null, slowest: null };
    const fastest = Math.min(...laps);
    const slowest = Math.max(...laps);
    return { fastest, slowest };
  };

  const { fastest, slowest } = getLapStats();

  const renderButtons = () => {
    const buttonClass = "h-20 w-20 text-lg flex-shrink-0 rounded-full text-white";
    
    if (time === 0 && !isRunning) {
        return (
            <div className="flex justify-center items-center h-20">
                <Button onClick={startTimer} className={cn(buttonClass, "bg-green-500 hover:bg-green-600")}>
                    <Play className="h-6 w-6" />
                </Button>
            </div>
        );
    }
    
    return (
      <div className="flex justify-between items-center h-20">
        <Button onClick={isRunning ? handleLap : handleReset} variant="secondary" className={cn(buttonClass, "bg-gray-500 hover:bg-gray-600 text-white")}>
          {isRunning ? <Flag /> : <RotateCcw />}
        </Button>
        <Button onClick={isRunning ? stopTimer : startTimer} className={cn(buttonClass, isRunning ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600")}>
          {isRunning ? <Pause /> : <Play />}
        </Button>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <Card ref={stopwatchRef} className={cn(
        "max-w-md mx-auto shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 bg-card flex flex-col",
         isFullScreen && "fixed inset-0 z-50 w-full h-full max-w-none rounded-none bg-background"
      )}>
        <CardHeader className="text-center shrink-0">
          <CardTitle className="text-3xl font-headline flex items-center justify-center gap-4">
             Stopwatch
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="animate-shake" onClick={handleFullScreenToggle}>
                            {isFullScreen ? <Minimize className="w-5 h-5"/> : <Expand className="w-5 h-5"/>}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                    <p>Mode Layar Penuh</p>
                    </TooltipContent>
                </Tooltip>
             </TooltipProvider>
              {isFullScreen && (
                  <Button variant="ghost" size="icon" onClick={handleFullScreenToggle} className="absolute top-4 right-4">
                      <X className="w-5 h-5"/>
                  </Button>
                )}
          </CardTitle>
          <CardDescription>Ukur waktu dengan presisi dan catat putaran.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow p-4 min-h-0">
          <div className="relative flex-grow flex flex-col items-center justify-center">
            <div className='absolute top-0 right-0 font-mono text-xl text-muted-foreground'>
                {laps.length > 0 && formatTotalLapsTime(laps)}
            </div>
            <div className={cn(
              "font-mono my-4 tracking-tight w-full text-center break-all p-2",
              isFullScreen ? "text-7xl sm:text-8xl" : "text-5xl"
            )}>
              {formatTime(time)}
            </div>
          </div>
          
          <div className="w-full max-w-xs mx-auto mb-4 shrink-0">
            {renderButtons()}
          </div>

          <div className='w-full flex-grow min-h-0 flex flex-col'>
             <ScrollArea className="flex-grow rounded-lg bg-secondary/30">
                {laps.length > 0 ? (
                <ul className='divide-y divide-border p-2'>
                    {laps.map((lap, index) => {
                        const isFastest = lap === fastest;
                        const isSlowest = lap === slowest;

                        return (
                            <li key={index} className="flex justify-between items-center p-3 font-mono text-lg">
                                <span className="text-muted-foreground">Putaran {laps.length - index}</span>
                                <div className='flex items-center gap-2'>
                                    {isFastest && <ArrowDown className='w-5 h-5 text-green-500' />}
                                    {isSlowest && <ArrowUp className='w-5 h-5 text-red-500' />}
                                    <span className={cn(
                                        isFastest && 'text-green-500 font-bold',
                                        isSlowest && 'text-red-500 font-bold'
                                    )}>
                                        {formatTime(lap)}
                                    </span>
                                </div>
                            </li>
                        )
                    }).reverse()}
                </ul>
                ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-8">
                    Tekan "Putaran" untuk mencatat waktu.
                </div>
                )}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
