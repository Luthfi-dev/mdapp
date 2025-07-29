import Link from "next/link";
import { Card, CardContent } from "./ui/card";
import type { ReactNode } from "react";
import { Button } from "./ui/button";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  isFavorited: boolean;
  onFavoriteToggle: () => void;
}

export function ToolCard({ href, icon, title, description, isFavorited, onFavoriteToggle }: ToolCardProps) {

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation(); // Stop event bubbling
    onFavoriteToggle();
  };

  return (
    <Link href={href} className="group block">
      <Card className="h-full transition-all duration-300 ease-in-out group-hover:shadow-lg group-hover:border-primary group-hover:-translate-y-1 bg-card/50 hover:bg-card">
        <CardContent className="p-5 flex flex-col justify-between h-full relative">
            <div className="absolute top-4 right-4 flex items-center gap-2">
                 <Button variant="ghost" size="icon" onClick={handleFavoriteClick} className="rounded-full h-8 w-8 z-10">
                    <Star className={cn("w-5 h-5 text-muted-foreground transition-colors", isFavorited && "text-yellow-400 fill-yellow-400")} />
                </Button>
                <div className="text-primary group-hover:text-primary transition-colors duration-300">
                    {icon}
                </div>
            </div>
            <div className="pr-10">
                <h3 className="font-bold text-lg leading-tight">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
        </CardContent>
      </Card>
    </Link>
  );
}