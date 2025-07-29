'use client';
import { useState, useCallback, useEffect } from 'react';
import { useToast } from './use-toast';

const REWARD_AMOUNT = 50;
const TOTAL_DAYS = 7;
const LOCAL_STORAGE_KEY_REWARD = 'dailyRewardState';
const LOCAL_STORAGE_KEY_USER = 'maudigiUser';

export interface ClaimState {
  isClaimed: boolean;
  isClaimable: boolean;
  isToday: boolean;
}

interface StoredRewardData {
  points: number;
  lastClaimDate: string | null; // 'YYYY-MM-DD'
  streak: number; // 0-7
}

interface UserData {
    userId: string;
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

  const getOrCreateUser = useCallback((): UserData => {
    try {
        const storedUser = window.localStorage.getItem(LOCAL_STORAGE_KEY_USER);
        if (storedUser) {
            return JSON.parse(storedUser);
        }
        const newUser: UserData = {
            userId: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        };
        window.localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(newUser));
        return newUser;
    } catch (error) {
        console.error("Failed to manage user data in localStorage", error);
        // Fallback for SSR or disabled storage
        return { userId: 'anonymous' };
    }
  }, []);

  const loadData = useCallback(() => {
    getOrCreateUser(); // Ensure user exists
    try {
      const storedDataRaw = window.localStorage.getItem(LOCAL_STORAGE_KEY_REWARD);
      if (storedDataRaw) {
        const data: StoredRewardData = JSON.parse(storedDataRaw);
        const todayStr = getTodayDateString();
        
        // Reset streak if user missed a day
        if (data.lastClaimDate && data.lastClaimDate !== todayStr && !isYesterday(data.lastClaimDate)) {
            data.streak = 0;
            // No need to reset lastClaimDate, it will allow claiming for today
             window.localStorage.setItem(LOCAL_STORAGE_KEY_REWARD, JSON.stringify(data));
        }

        setPoints(data.points || 0);
        return data;
      }
    } catch (error) {
      console.error("Failed to load or parse daily reward data from localStorage", error);
    }
    // Default initial data if nothing is stored
    const defaultData: StoredRewardData = { points: 1250, lastClaimDate: null, streak: 0 };
    window.localStorage.setItem(LOCAL_STORAGE_KEY_REWARD, JSON.stringify(defaultData));
    setPoints(defaultData.points);
    return defaultData;
  }, [getOrCreateUser]);

  const updateClaimState = useCallback(() => {
    const data = loadData();
    const todayStr = getTodayDateString();

    const newClaimState = Array.from({ length: TOTAL_DAYS }, (_, i) => {
      const alreadyClaimedToday = data.lastClaimDate === todayStr;
      
      // A day is claimable if it matches the current streak count AND it hasn't been claimed today.
      const isClaimable = i === data.streak && !alreadyClaimedToday;
      
      // A day is marked as claimed if its index is less than the current streak.
      const isClaimed = i < data.streak;

      // isToday is purely based on the day of the week, for UI highlighting.
      const isToday = i === getDayIndex(new Date());

      return {
        isClaimed,
        isClaimable,
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
    
    // The day being claimed must match the current streak progress.
    if (dayIndex !== data.streak) {
         toast({ variant: 'destructive', title: 'Klaim Gagal', description: 'Anda harus klaim secara berurutan.' });
        return false;
    }

    try {
      const newPoints = data.points + REWARD_AMOUNT;
      // If streak reaches 7, it resets to 0 for the next cycle.
      const newStreak = (data.streak + 1) % TOTAL_DAYS; 
      
      const newData: StoredRewardData = {
        points: newPoints,
        lastClaimDate: todayStr,
        streak: newStreak,
      };
      
      window.localStorage.setItem(LOCAL_STORAGE_KEY_REWARD, JSON.stringify(newData));
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