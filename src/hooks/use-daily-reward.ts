
'use client';
import { useState, useCallback, useEffect } from 'react';
import { useToast } from './use-toast';

const REWARD_AMOUNT = 50;
const TOTAL_DAYS = 7;
const LOCAL_STORAGE_KEY_REWARD = 'dailyRewardState_v2';

export interface ClaimState {
  isClaimed: boolean;
  isClaimable: boolean;
  isToday: boolean;
}

interface StoredRewardData {
  points: number;
  lastClaimTimestamps: { [dayIndex: number]: string }; // 'YYYY-MM-DD'
}

const getDayIndex = (date: Date) => {
    return (date.getDay() + 6) % 7; // Monday = 0, Sunday = 6
}

const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
}

export function useDailyReward() {
  const [points, setPoints] = useState<number>(0);
  const [claimState, setClaimState] = useState<ClaimState[]>([]);
  const { toast } = useToast();

  const loadData = useCallback((): StoredRewardData => {
    try {
      const storedDataRaw = window.localStorage.getItem(LOCAL_STORAGE_KEY_REWARD);
      if (storedDataRaw) {
        const data: StoredRewardData = JSON.parse(storedDataRaw);
        // Basic validation in case stored data is malformed
        if (data && typeof data.points === 'number' && typeof data.lastClaimTimestamps === 'object') {
           setPoints(data.points);
           return data;
        }
      }
    } catch (error) {
      console.error("Failed to load or parse daily reward data from localStorage", error);
    }
    // Default initial data if nothing is stored or data is invalid
    const defaultData: StoredRewardData = { points: 1250, lastClaimTimestamps: {} };
     try {
        window.localStorage.setItem(LOCAL_STORAGE_KEY_REWARD, JSON.stringify(defaultData));
    } catch(e) {
        console.error("Failed to set default reward data", e)
    }
    setPoints(defaultData.points);
    return defaultData;
  }, []);

  const updateClaimState = useCallback(() => {
    const data = loadData();
    const todayStr = getTodayDateString();
    const todayIndex = getDayIndex(new Date());

    const newClaimState = Array.from({ length: TOTAL_DAYS }, (_, i) => {
      const isToday = i === todayIndex;
      // A day is claimed if the last claim timestamp for that day is today's date.
      const isClaimed = data.lastClaimTimestamps[i] === todayStr;
      // A day is claimable only if it's today AND it hasn't been claimed yet.
      const isClaimable = isToday && !isClaimed;

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
    const todayIndex = getDayIndex(new Date());

    if (dayIndex !== todayIndex) {
        toast({ 
            variant: "destructive", 
            title: 'Klaim Gagal', 
            description: 'Anda hanya dapat mengklaim hadiah untuk hari ini.' 
        });
        return false;
    }

    const todayStr = getTodayDateString();
    if (data.lastClaimTimestamps[todayIndex] === todayStr) {
        toast({ 
            variant: 'destructive',
            title: 'Sudah Diklaim', 
            description: 'Anda sudah mengklaim hadiah untuk hari ini.' 
        });
        return false;
    }

    try {
      const newPoints = data.points + REWARD_AMOUNT;
      const newTimestamps = { ...data.lastClaimTimestamps, [todayIndex]: todayStr };
      
      const newData: StoredRewardData = {
        points: newPoints,
        lastClaimTimestamps: newTimestamps,
      };
      
      window.localStorage.setItem(LOCAL_STORAGE_KEY_REWARD, JSON.stringify(newData));
      setPoints(newPoints);
      updateClaimState(); // Refresh UI state after claiming
      
      toast({
          title: 'Klaim Berhasil!',
          description: `Selamat! Anda mendapatkan ${REWARD_AMOUNT} Coin. Sampai jumpa besok!`,
      });
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
