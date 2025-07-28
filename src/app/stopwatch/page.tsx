
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Pause, RotateCcw, Flag, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StopwatchPage() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const startTimer = () => {
    setIsRunning(true);
    timerRef.current = setInterval(() => {
      setTime(prevTime => prevTime + 10); // Update every 10ms for accuracy
    }, 10);
  };
  
  const stopTimer = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleStartStop = () => {
    if (isRunning) {
      stopTimer();
    } else {
      startTimer();
    }
  };

  const handleLap = () => {
    if (isRunning) {
      setLaps(prevLaps => [time, ...prevLaps]);
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

  const getLapStats = () => {
    if (laps.length < 2) return { fastest: null, slowest: null };
    const lapTimes = laps.map((lap, i) => i === 0 ? lap : lap - (laps[i-1] || 0)).reverse().slice(1);
    const fastest = Math.min(...lapTimes);
    const slowest = Math.max(...lapTimes);
    return { fastest, slowest };
  };

  const { fastest, slowest } = getLapStats();

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <Card className="max-w-md mx-auto shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Stopwatch</CardTitle>
          <CardDescription>Ukur waktu dengan presisi dan catat putaran.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="font-mono text-7xl md:text-8xl my-8 tracking-tighter w-full text-center bg-secondary/50 py-4 rounded-2xl">
            {formatTime(time)}
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full mb-6">
            <Button onClick={handleReset} variant="outline" className="h-16 rounded-2xl text-lg" disabled={time === 0}>
                <RotateCcw className="mr-2" /> Reset
            </Button>
            <Button onClick={handleLap} variant="outline" className="h-16 rounded-2xl text-lg" disabled={!isRunning}>
                <Flag className="mr-2" /> Putaran
            </Button>
             <Button onClick={handleStartStop} className="col-span-2 h-20 rounded-2xl text-2xl font-bold">
              {isRunning ? <><Pause className="mr-2" /> Jeda</> : <><Play className="mr-2" /> Mulai</>}
            </Button>
          </div>

          <ScrollArea className="h-48 w-full bg-secondary/50 rounded-lg p-2">
            {laps.length > 0 ? (
              <ul className='divide-y divide-border'>
                {laps.map((lap, index) => {
                    const prevLap = laps[index + 1] || 0;
                    const lapTime = lap - prevLap;
                    const isFastest = lapTime === fastest;
                    const isSlowest = lapTime === slowest;

                    return (
                        <li key={index} className="flex justify-between items-center p-2 font-mono text-lg">
                            <span className="text-muted-foreground">Putaran {laps.length - index}</span>
                            <div className='flex items-center gap-2'>
                                {isFastest && <ArrowDown className='w-5 h-5 text-green-500' />}
                                {isSlowest && <ArrowUp className='w-5 h-5 text-red-500' />}
                                <span className={cn(
                                    isFastest && 'text-green-500 font-bold',
                                    isSlowest && 'text-red-500 font-bold'
                                )}>
                                    {formatTime(lapTime)}
                                </span>
                            </div>
                        </li>
                    )
                }).reverse()}
              </ul>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                Tekan "Putaran" untuk mencatat waktu.
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
