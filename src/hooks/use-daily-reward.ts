
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

// Helper to get day of the week (0 for Sunday, 1 for Monday, etc., we'll adjust to 0 for Monday)
const getDayIndex = () => {
    const d = new Date();
    // Monday is 0, Sunday is 6
    return (d.getDay() + 6) % 7;
}

const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
}

export function useDailyReward() {
  const [points, setPoints] = useState<number>(0);
  const [claimState, setClaimState] = useState<ClaimState[]>([]);
  const { toast } = useToast();

  const getInitialState = useCallback((): StoredData => {
    if (typeof window === 'undefined') {
        return { points: 1250, lastClaimDates: {} };
    }
    try {
      const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (item) {
        const data = JSON.parse(item);
        // Basic validation
        if (typeof data.points === 'number' && typeof data.lastClaimDates === 'object') {
            return data;
        }
      }
    } catch (error) {
      console.error("Failed to read from localStorage", error);
    }
    // Default initial state if nothing in localStorage or data is corrupt
    return { points: 1250, lastClaimDates: {} };
  }, []);

  const updateClaimState = useCallback(() => {
    const todayIndex = getDayIndex();
    const todayDateString = getTodayDateString();
    const storedData = getInitialState();

    const newClaimState = Array.from({ length: TOTAL_DAYS }, (_, i) => {
      const lastClaimDate = storedData.lastClaimDates[i];
      // A day is claimed if its last claim date is within the current week's cycle, not just today.
      // This logic needs to be more robust for a real app, but for this weekly reset model:
      const isClaimed = !!storedData.lastClaimDates[i];

      return {
        isClaimed,
        isClaimable: i === todayIndex && !isClaimed,
        isToday: i === todayIndex,
      };
    });

    setClaimState(newClaimState);
    setPoints(storedData.points);
  }, [getInitialState]);


  useEffect(() => {
    updateClaimState();
  }, [updateClaimState]);

  const claimReward = useCallback((dayIndex: number) => {
    return new Promise<boolean>((resolve) => {
        const todayIndex = getDayIndex();
        if (dayIndex !== todayIndex) {
            toast({
                variant: 'destructive',
                title: 'Gagal Klaim',
                description: 'Anda hanya bisa klaim hadiah untuk hari ini.'
            });
            resolve(false);
            return;
        }

        const storedData = getInitialState();
        
        if (storedData.lastClaimDates[dayIndex]) {
            toast({
                variant: 'destructive',
                title: 'Sudah Diklaim',
                description: 'Anda sudah mengklaim hadiah untuk hari ini.'
            });
             resolve(false);
            return;
        }
        
        const newPoints = storedData.points + REWARD_AMOUNT;
        const newLastClaimDates = { ...storedData.lastClaimDates, [dayIndex]: getTodayDateString() };

        try {
            window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
                points: newPoints,
                lastClaimDates: newLastClaimDates
            }));
            
            // Defer state update to allow animation to feel more responsive
            setTimeout(() => {
                setPoints(newPoints);
                updateClaimState();

                toast({
                    title: `+${REWARD_AMOUNT} Poin!`,
                    description: `Hadiah harian berhasil diklaim.`,
                    className: 'bg-green-500 text-white border-green-600'
                });
            }, 300); // Small delay for closing animation

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
  }, [getInitialState, toast, updateClaimState]);
  
  const refreshClaimState = () => {
    updateClaimState();
  }

  return { points, claimState, claimReward, refreshClaimState };
}
