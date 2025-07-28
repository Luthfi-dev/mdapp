
'use client';
import { useEffect, useState, useRef } from 'react';

interface CountUpProps {
    start?: number;
    end: number;
    duration?: number;
}

export function CountUp({ start = 0, end, duration = 2 }: CountUpProps) {
    const [count, setCount] = useState(start);
    const frameRef = useRef<number>();
    const startTimeRef = useRef<number>();

    useEffect(() => {
        startTimeRef.current = performance.now();
        const animate = (currentTime: number) => {
            if (!startTimeRef.current) return;
            
            const elapsedTime = currentTime - startTimeRef.current;
            const progress = Math.min(elapsedTime / (duration * 1000), 1);
            
            // Ease-out function
            const easedProgress = 1 - Math.pow(1 - progress, 3);

            const currentCount = Math.floor(easedProgress * (end - start) + start);
            setCount(currentCount);

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                setCount(end); // Ensure it ends exactly on the end value
            }
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [start, end, duration]);

    return <span>{count.toLocaleString()}</span>;
}
