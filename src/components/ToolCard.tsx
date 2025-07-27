import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
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
      <Card className="h-full transition-all duration-300 ease-in-out group-hover:shadow-lg group-hover:border-primary group-hover:-translate-y-1">
        <CardHeader className="flex flex-col items-center text-center">
          {icon}
          <CardTitle className="mt-4 font-headline">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-center">{description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
