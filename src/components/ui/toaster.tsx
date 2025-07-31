
"use client"

import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "./button";


export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const onDismiss = () => dismiss(id);
        const Icon = variant === 'destructive' ? XCircle : CheckCircle2;
        const iconColor = variant === 'destructive' ? 'text-destructive' : 'text-green-500';
        
        return (
          <AlertDialog key={id} open={props.open} onOpenChange={(open) => {
            if(!open) onDismiss();
          }}>
            <AlertDialogContent className="max-w-xs rounded-2xl shadow-2xl">
              <AlertDialogHeader className="items-center text-center">
                <Icon className={`w-14 h-14 mb-2 ${iconColor}`} />
                <AlertDialogTitle className="text-xl">
                  {title}
                </AlertDialogTitle>
                {description && (
                  <AlertDialogDescription className="text-base">
                    {description}
                  </AlertDialogDescription>
                )}
              </AlertDialogHeader>
              <AlertDialogFooter>
                {action ? (
                  action
                ) : (
                  <Button
                    onClick={onDismiss}
                    className="w-full text-lg font-bold rounded-full h-12 shadow-lg shadow-primary/30 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground transition-all duration-300 hover:shadow-primary/50 hover:scale-105 active:scale-95"
                    variant={variant === 'destructive' ? 'destructive' : 'default'}
                  >
                    Oke
                  </Button>
                )}
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )
      })}
    </>
  )
}
