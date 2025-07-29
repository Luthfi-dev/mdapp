
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
  lastClaimDate: string | null; // 'YYYY-MM-DD'
  streak: number; // 0-7
}

const getDayIndex = (date: Date) => {
    return (date.getDay() + 6) % 7;
}

const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
}

const isYesterday = (dateString: string) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return dateString === yesterday.toISOString().split('T')[0];
}

export function useDailyReward() {
  const [points, setPoints] = useState<number>(0);
  const [claimState, setClaimState] = useState<ClaimState[]>([]);
  const { toast } = useToast();

  const loadData = useCallback(() => {
    try {
      const storedDataRaw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedDataRaw) {
        const data: StoredData = JSON.parse(storedDataRaw);
        const todayStr = getTodayDateString();
        
        // Reset streak if user missed a day
        if (data.lastClaimDate && data.lastClaimDate !== todayStr && !isYesterday(data.lastClaimDate)) {
            data.streak = 0;
            data.lastClaimDate = null; // Reset date as well, so they can claim for today
             window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        }

        setPoints(data.points || 0);
        return data;
      }
    } catch (error) {
      console.error("Failed to load or parse daily reward data from localStorage", error);
    }
    // Default initial data if nothing is stored
    const defaultData: StoredData = { points: 1250, lastClaimDate: null, streak: 0 };
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultData));
    setPoints(defaultData.points);
    return defaultData;
  }, []);

  const updateClaimState = useCallback(() => {
    const data = loadData();
    const todayIndex = getDayIndex(new Date());
    const todayStr = getTodayDateString();

    const newClaimState = Array.from({ length: TOTAL_DAYS }, (_, i) => {
      const isToday = i === todayIndex;
      const alreadyClaimedToday = data.lastClaimDate === todayStr;
      
      return {
        isClaimed: i < data.streak || (i === todayIndex && alreadyClaimedToday),
        isClaimable: i === data.streak && !alreadyClaimedToday,
        isToday,
      };
    });
    setClaimState(newClaimState);
  }, [loadData]);


  useEffect(() => {
    updateClaimState();
  }, [updateClaimState]);

  const claimReward = useCallback(async (dayIndex: number): Promise<boolean> => {
    const data = loadData();
    const todayStr = getTodayDateString();

    if (data.lastClaimDate === todayStr) {
        toast({ variant: 'destructive', title: 'Sudah Diklaim', description: 'Anda sudah mengklaim hadiah untuk hari ini.' });
        return false;
    }
    
    if (dayIndex !== data.streak) {
         toast({ variant: 'destructive', title: 'Klaim Gagal', description: 'Anda harus klaim secara berurutan.' });
        return false;
    }

    try {
      const newPoints = data.points + REWARD_AMOUNT;
      const newStreak = (data.streak + 1) % TOTAL_DAYS;
      
      const newData: StoredData = {
        points: newPoints,
        lastClaimDate: todayStr,
        streak: newStreak,
      };
      
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
      setPoints(newPoints);
      updateClaimState(); // Refresh UI state after claiming
      return true;

    } catch (error) {
        console.error("Failed to save to localStorage", error);
        toast({
            variant: 'destructive',
            title: 'Gagal Menyimpan',
            description: 'Tidak dapat menyimpan progres klaim Coin Anda.'
        });
        return false;
    }
  }, [loadData, toast, updateClaimState]);
  
  const refreshClaimState = () => {
    updateClaimState();
  }

  return { points, claimState, claimReward, refreshClaimState };
}
