
'use client';
import { useEffect, useState, useRef } from 'react';

interface CountUpProps {
    end: number;
    duration?: number;
}

export function CountUp({ end, duration = 1.5 }: CountUpProps) {
    const [count, setCount] = useState(end);
    const [isMounted, setIsMounted] = useState(false);
    const frameRef = useRef<number>();
    const prevEndRef = useRef(end);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        // Don't run the animation on the server or on initial client render before mount.
        if (!isMounted) return;

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

        // If the `end` value changes, start the animation.
        if (end !== prevEndRef.current) {
            frameRef.current = requestAnimationFrame(animate);
        } else {
            // If `end` hasn't changed, just ensure the count is correct without animation.
            setCount(end);
        }


        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
             // Update the ref to the latest `end` value when the component re-renders or unmounts
            prevEndRef.current = end;
        };
    }, [end, duration, isMounted]);

    // Render raw number on server and on initial client render.
    // Format only after the component has mounted on the client.
    return <span>{isMounted ? count.toLocaleString('id-ID') : count}</span>;
}
