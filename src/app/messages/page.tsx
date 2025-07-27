'use client';
import { useState, useRef, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chat, ChatMessage } from "@/ai/flows/chat";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (viewportRef.current) {
            viewportRef.current.scrollTo({
                top: viewportRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        
        setTimeout(() => scrollToBottom(), 100);

        setIsLoading(true);

        try {
            const aiResponse = await chat(newMessages);
            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error("Error getting AI response:", error);
            const errorMessage: ChatMessage = { role: 'model', content: "Maaf, terjadi kesalahan. Coba lagi nanti." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background">
             <CardHeader className="flex flex-row items-center gap-3 border-b sticky top-0 bg-background z-10">
                 <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground"><Bot /></AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="font-bold text-lg">Assisten Maudigi</CardTitle>
                    <p className="text-sm text-muted-foreground">Online</p>
                </div>
            </CardHeader>
            <div className="flex-grow flex flex-col">
                <ScrollArea className="flex-grow" ref={scrollAreaRef} viewportRef={viewportRef}>
                    <div className="space-y-6 p-4 pb-24">
                        {messages.map((message, index) => (
                            <div key={index} className={cn("flex items-end gap-2", message.role === 'user' ? "justify-end" : "justify-start")}>
                                {message.role === 'model' && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-primary text-primary-foreground"><Bot /></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn(
                                    "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                                    message.role === 'user'
                                        ? "bg-primary text-primary-foreground rounded-br-none"
                                        : "bg-card text-card-foreground border rounded-bl-none"
                                )}>
                                    <p>{message.content}</p>
                                </div>
                                 {message.role === 'user' && (
                                    <Avatar className="h-8 w-8">
                                         <AvatarFallback><User /></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                             <div className="flex items-end gap-2 justify-start">
                                 <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary text-primary-foreground"><Bot /></AvatarFallback>
                                </Avatar>
                                <div className="bg-card text-card-foreground border rounded-2xl rounded-bl-none px-4 py-3">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground"/>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <CardFooter className="p-4 border-t sticky bottom-20 bg-background">
                    <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ketik pesan Anda..."
                            className="flex-grow rounded-full h-12 px-5"
                            disabled={isLoading}
                        />
                        <Button type="submit" size="icon" className="rounded-full w-12 h-12" disabled={isLoading || !input.trim()}>
                            <Send className="h-5 w-5" />
                        </Button>
                    </form>
                </CardFooter>
            </div>
        </div>
    );
}
