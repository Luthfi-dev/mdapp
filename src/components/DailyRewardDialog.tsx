
'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Check, Gift, Star, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClaimState } from "@/hooks/use-daily-reward";
import React, { useState } from 'react';

const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

interface DailyRewardDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  claimState: ClaimState[];
  onClaim: (dayIndex: number) => Promise<boolean>;
}

const RewardItem = React.memo(({ dayIndex, state, onClaim, onSuccessfulClaim }: { dayIndex: number, state: ClaimState, onClaim: (dayIndex: number) => Promise<boolean>, onSuccessfulClaim: () => void }) => {
  const { isClaimed, isClaimable, isToday } = state;
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaim = async () => {
    setIsClaiming(true);
    const success = await onClaim(dayIndex);
    if (success) {
      onSuccessfulClaim();
    }
    setIsClaiming(false);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <span className={cn("font-bold text-sm", isToday ? "text-primary" : "text-muted-foreground")}>{dayNames[dayIndex]}</span>
      <div className={cn("relative w-20 h-24 rounded-2xl flex flex-col items-center justify-center transition-all duration-300", 
        isClaimed ? "bg-green-100 border-2 border-green-300" :
        isClaimable ? "bg-primary/10 border-2 border-primary" :
        "bg-secondary/50 border-2 border-dashed"
      )}>
        {isToday && !isClaimed && (
          <div className="absolute -top-2 px-2 py-0.5 text-xs font-bold text-white bg-primary rounded-full animate-bounce">
            HARI INI
          </div>
        )}
        <div className={cn("absolute top-3 transition-transform duration-500", isClaimed ? 'scale-0' : 'scale-100')}>
            <Gift className={cn("w-8 h-8", isClaimable ? "text-primary" : "text-muted-foreground/50")} />
        </div>
        <div className={cn("absolute top-3 transition-transform duration-500", isClaimed ? 'scale-100' : 'scale-0')}>
            <Check className="w-8 h-8 text-green-500" />
        </div>
        <div className="absolute bottom-3 text-center">
          <p className={cn("font-bold text-lg", isClaimed ? "text-green-600" : isClaimable ? "text-primary" : "text-muted-foreground/80")}>
            +50
          </p>
          <p className={cn("text-xs font-semibold", isClaimed ? "text-green-500" : "text-muted-foreground")}>
            Poin
          </p>
        </div>
      </div>
      <Button
        size="sm"
        className="w-full mt-1 h-8"
        disabled={!isClaimable || isClaimed || isClaiming}
        onClick={handleClaim}
      >
        {isClaiming ? <Loader2 className="w-4 h-4 animate-spin"/> : (isClaimed ? "Diklaim" : "Klaim")}
      </Button>
    </div>
  );
});

RewardItem.displayName = 'RewardItem';

export function DailyRewardDialog({ isOpen, onOpenChange, claimState, onClaim }: DailyRewardDialogProps) {

  const handleSuccessfulClaim = () => {
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95%] rounded-2xl shadow-2xl border-0 bg-gradient-to-br from-card to-background/80 backdrop-blur-sm">
        <DialogHeader className="text-center items-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20 mb-2">
            <Star className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <DialogTitle className="text-2xl font-bold">Hadiah Harian</DialogTitle>
          <DialogDescription>
            Klaim hadiah setiap hari untuk mendapatkan poin!
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-3 py-4">
          {claimState.slice(0, 4).map((state, index) => (
            <RewardItem key={index} dayIndex={index} state={state} onClaim={onClaim} onSuccessfulClaim={handleSuccessfulClaim}/>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {claimState.slice(4).map((state, index) => (
            <RewardItem key={index + 4} dayIndex={index + 4} state={state} onClaim={onClaim} onSuccessfulClaim={handleSuccessfulClaim}/>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
