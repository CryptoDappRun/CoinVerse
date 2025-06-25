"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, type Timestamp, limit } from 'firebase/firestore';
import type { ChatMessage as ChatMessageType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Skeleton } from './ui/skeleton';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatMessage extends Omit<ChatMessageType, 'timestamp'> {
    timestamp: Timestamp | null;
}

interface ChatBoxProps {
    cryptoId: string;
}

export default function ChatBox({ cryptoId }: ChatBoxProps) {
    const { user, loading: authLoading } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const viewportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!cryptoId) return;

        setIsLoadingMessages(true);
        const q = query(collection(db, `chats/${cryptoId}/messages`), orderBy("timestamp", "desc"), limit(100));
        
        const unsubscribe = onSnapshot(q, 
            (querySnapshot) => {
                const msgs: ChatMessage[] = [];
                querySnapshot.forEach((doc) => {
                    msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
                });
                setMessages(msgs.reverse());
                setIsLoadingMessages(false);
            },
            (error) => {
                console.error("Error fetching chat messages:", error);
                setIsLoadingMessages(false);
            }
        );

        return () => unsubscribe();
    }, [cryptoId]);
    
    useEffect(() => {
        const viewport = viewportRef.current;
        if (viewport) {
           viewport.scrollTop = viewport.scrollHeight;
        }
    }, [messages]);


    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user || isSending || !user.displayName) return;

        setIsSending(true);
        const textToSend = newMessage;
        setNewMessage(""); // Optimistically clear input for better UX

        try {
            await addDoc(collection(db, `chats/${cryptoId}/messages`), {
                text: textToSend,
                timestamp: serverTimestamp(),
                userId: user.uid,
                userName: user.displayName,
            });
        } catch (error) {
            console.error("Error sending message:", error);
            setNewMessage(textToSend); // On error, restore the message
        } finally {
            setIsSending(false);
        }
    };
    
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleSendMessage();
    };

    if (authLoading) {
         return (
            <Card className="h-full max-h-[600px] flex flex-col">
                <CardHeader>
                    <CardTitle>Live Chat</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                    <Skeleton className="h-full w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
        );
    }

    if (!user) {
        return (
            <Card className="flex flex-col h-full max-h-[600px]">
                <CardHeader>
                    <CardTitle>Live Chat</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center text-center">
                    <p className="text-muted-foreground mb-4">You must be logged in to join the chat.</p>
                    <Button asChild>
                        <Link href="/login">Login to Chat</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="flex flex-col h-full max-h-[600px]">
            <CardHeader>
                <CardTitle>Live Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
               <ScrollArea className="h-full" viewportRef={viewportRef}>
                    <div className="p-6 space-y-4">
                        {isLoadingMessages ? (
                            <div className="space-y-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                                No messages yet. Be the first to start the conversation!
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{msg.userName?.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-baseline gap-2">
                                            <p className="font-semibold text-sm">{msg.userName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                    {msg.timestamp?.toDate && formatDistanceToNow(msg.timestamp.toDate(), { addSuffix: true })}
                                            </p>
                                        </div>
                                        <p className="text-sm text-foreground/90 break-words">{msg.text}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
               </ScrollArea>
            </CardContent>
            <CardFooter className="p-6 pt-4 border-t">
                <form onSubmit={handleFormSubmit} className="flex items-start gap-2 w-full">
                    <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 resize-none"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                    />
                    <Button type="submit" disabled={isSending || !newMessage.trim()}>
                        {isSending && <Loader2 className="animate-spin" />}
                        Send
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
