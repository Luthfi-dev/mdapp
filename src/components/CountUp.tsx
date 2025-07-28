
'use client';
import { useEffect, useState, useRef } from 'react';

interface CountUpProps {
    end: number;
    duration?: number;
}

export function CountUp({ end, duration = 1.5 }: CountUpProps) {
    const [count, setCount] = useState(end);
    const frameRef = useRef<number>();
    const prevEndRef = useRef(end);

    useEffect(() => {
        const start = prevEndRef.current;
        let startTime: number | null = null;

        const animate = (currentTime: number) => {
            if (startTime === null) {
                startTime = currentTime;
            }
            
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / (duration * 1000), 1);
            
            // Ease-out function
            const easedProgress = 1 - Math.pow(1 - progress, 4);

            const currentCount = Math.floor(easedProgress * (end - start) + start);
            setCount(currentCount);

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                setCount(end); // Ensure it ends exactly on the end value
                prevEndRef.current = end;
            }
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
             prevEndRef.current = end;
        };
    }, [end, duration]);

    return <span>{count.toLocaleString()}</span>;
}
