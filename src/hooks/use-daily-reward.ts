
'use client';
import { useState, useCallback, useEffect } from 'react';
import { useToast } from './use-toast';

const REWARD_AMOUNT = 50;
const TOTAL_DAYS = 7;
const LOCAL_STORAGE_KEY = 'dailyRewardState';

export interface ClaimState {
  isClaimed: boolean;
  isClaimable: boolean;
  isToday: boolean;
}

interface StoredData {
  points: number;
  lastClaimDates: { [key: number]: string }; // Store date string 'YYYY-MM-DD'
}

const getDayIndex = () => {
    const d = new Date();
    return (d.getDay() + 6) % 7;
}

const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
}

export function useDailyReward() {
  const [points, setPoints] = useState<number>(1250);
  const [claimState, setClaimState] = useState<ClaimState[]>([]);
  const { toast } = useToast();

  const updateClaimState = useCallback(() => {
    const todayIndex = getDayIndex();
    const newClaimState = Array.from({ length: TOTAL_DAYS }, (_, i) => {
      // For development, we'll just base it on a simple state
      // In a real app, this would be based on localStorage/backend data
      const isClaimed = false; // Let's assume nothing is claimed initially for dev
      return {
        isClaimed,
        isClaimable: true, // Allow claiming any day for dev
        isToday: i === todayIndex,
      };
    });
    setClaimState(newClaimState);
  }, []);


  useEffect(() => {
    // For now, just initialize the state
     const storedData = window.localStorage.getItem(LOCAL_STORAGE_KEY);
     if (storedData) {
       setPoints(JSON.parse(storedData).points || 1250);
     }
    updateClaimState();
  }, [updateClaimState]);

  const claimReward = useCallback((dayIndex: number) => {
    return new Promise<boolean>((resolve) => {
        // DEVELOPMENT MODE: No validation, just give points.
        const newPoints = points + REWARD_AMOUNT;
        
        try {
            // Still save points to localStorage so it persists
            const storedData = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
            window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
                ...storedData,
                points: newPoints,
            }));

            setPoints(newPoints);
            resolve(true);

        } catch (error) {
            console.error("Failed to write to localStorage", error);
            toast({
                variant: 'destructive',
                title: 'Gagal Menyimpan',
                description: 'Tidak dapat menyimpan progres klaim Anda.'
            });
             resolve(false);
        }
    });
  }, [points, toast]);
  
  const refreshClaimState = () => {
    updateClaimState();
  }

  return { points, claimState, claimReward, refreshClaimState };
}
