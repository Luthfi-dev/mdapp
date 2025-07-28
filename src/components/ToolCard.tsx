
import Link from "next/link";
import { Card, CardContent } from "./ui/card";
import type { ReactNode } from "react";

interface ToolCardProps {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
}

export function ToolCard({ href, icon, title, description }: ToolCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:border-primary group-hover:-translate-y-1.5 bg-card/50 hover:bg-card">
        <CardContent className="p-5 flex flex-col items-start justify-between h-full">
            <div className="mb-8">
                {icon}
            </div>
            <div>
                <h3 className="font-bold text-lg leading-tight">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
        </CardContent>
      </Card>
    </Link>
  );
}
