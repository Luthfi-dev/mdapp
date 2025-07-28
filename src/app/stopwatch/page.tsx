
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
  const [lastLapTime, setLastLapTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isFullScreen, setIsFullScreen] = useState(false);
  const stopwatchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const handleFullScreenToggle = () => {
    if (!stopwatchRef.current) return;
    if (!document.fullscreenElement) {
      stopwatchRef.current.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
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

  const handleStartStop = () => {
    if (isRunning) {
      stopTimer();
    } else {
      startTimer();
    }
  };

  const handleLap = () => {
    if (isRunning) {
      const currentLapTime = time - lastLapTime;
      setLaps(prevLaps => [currentLapTime, ...prevLaps]);
      setLastLapTime(time);
    }
  };

  const handleReset = () => {
    stopTimer();
    setTime(0);
    setLaps([]);
    setLastLapTime(0);
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

  const getLapStats = () => {
    if (laps.length === 0) return { fastest: null, slowest: null };
    const fastest = Math.min(...laps);
    const slowest = Math.max(...laps);
    return { fastest, slowest };
  };

  const { fastest, slowest } = getLapStats();
  
  const lapButtonLogic = () => {
      if(isRunning) {
          return (
             <Button onClick={handleLap} variant="outline" className="h-16 rounded-2xl text-lg flex-1">
                <Flag className="mr-2" /> Putaran
            </Button>
          )
      }
      if(!isRunning && time > 0) {
           return (
             <Button onClick={handleReset} variant="outline" className="h-16 rounded-2xl text-lg flex-1">
                <RotateCcw className="mr-2" /> Reset
            </Button>
          )
      }
      return <div className='flex-1'></div>
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <Card ref={stopwatchRef} className={cn(
        "max-w-md mx-auto shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 bg-background flex flex-col",
         isFullScreen && "fixed inset-0 z-50 w-full h-full max-w-none rounded-none"
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
        <CardContent className={cn("flex flex-col items-center flex-grow p-4", isFullScreen ? "p-2 sm:p-4" : "p-6")}>
          <div className="font-mono text-7xl md:text-8xl my-4 tracking-tighter w-full text-center bg-secondary/50 py-4 rounded-2xl break-all">
            {formatTime(time)}
          </div>
          
          <div className="flex gap-4 w-full mb-6">
             {lapButtonLogic()}
             <Button onClick={handleStartStop} className="h-16 rounded-2xl text-lg font-bold flex-1">
              {isRunning ? <><Pause className="mr-2" /> Jeda</> : <><Play className="mr-2" /> Mulai</>}
            </Button>
          </div>

          <div className='w-full flex-grow min-h-0 flex flex-col'>
            <h3 className='font-bold text-lg mb-2 text-center shrink-0'>Riwayat Putaran</h3>
             <ScrollArea className="flex-grow bg-secondary/50 rounded-lg p-2">
                {laps.length > 0 ? (
                <ul className='divide-y divide-border'>
                    {laps.slice().reverse().map((lap, index) => {
                        const isFastest = lap === fastest;
                        const isSlowest = lap === slowest;

                        return (
                            <li key={index} className="flex justify-between items-center p-2 font-mono text-lg">
                                <span className="text-muted-foreground">Putaran {index + 1}</span>
                                <div className='flex items-center gap-2'>
                                    {isFastest && laps.length > 1 && <ArrowDown className='w-5 h-5 text-green-500' />}
                                    {isSlowest && laps.length > 1 && <ArrowUp className='w-5 h-5 text-red-500' />}
                                    <span className={cn(
                                        isFastest && laps.length > 1 && 'text-green-500 font-bold',
                                        isSlowest && laps.length > 1 && 'text-red-500 font-bold'
                                    )}>
                                        {formatTime(lap)}
                                    </span>
                                </div>
                            </li>
                        )
                    })}
                </ul>
                ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
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
