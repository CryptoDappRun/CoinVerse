
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import ChatBox from '@/components/chat-box';
import type { Cryptocurrency } from '@/types';
import ChartWrapper from '@/components/chart-wrapper';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import CryptoIcon from './crypto-icon';

const formatCurrency = (value: number, highPrecision = false) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: highPrecision ? 8 : 2,
    }).format(value);
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 2,
    }).format(value);
}

function DetailPageSkeleton() {
    return (
        <div className="container mx-auto py-8 px-4 animate-pulse">
            <div className="flex items-center gap-4 mb-8">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-8 w-24" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Skeleton className="h-32 rounded-lg" />
                <Skeleton className="h-32 rounded-lg" />
                <Skeleton className="h-32 rounded-lg" />
                <Skeleton className="h-32 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Skeleton className="h-[600px] rounded-lg" />
                </div>
                <div className="lg:col-span-1">
                    <Skeleton className="h-[600px] rounded-lg" />
                </div>
            </div>
        </div>
    )
}

export default function CryptoDetailView() {
    const params = useParams();
    const cryptoId = params.id as string;
    const [crypto, setCrypto] = useState<Cryptocurrency | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchCryptoData = async () => {
            setIsLoading(true);
            setError(null);
            const cacheKey = `crypto-detail-${cryptoId}`;

            try {
                const response = await fetch(`https://api.coingecko.com/api/v3/coins/${cryptoId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                const coin = await response.json();

                if (!coin || !coin.id) {
                     throw new Error('Invalid data received from API');
                }
                
                const cryptoData: Cryptocurrency = {
                    id: coin.id,
                    rank: coin.market_cap_rank,
                    name: coin.name,
                    symbol: coin.symbol.toUpperCase(),
                    price: coin.market_data.current_price.usd,
                    marketCap: coin.market_data.market_cap.usd,
                    change24h: coin.market_data.price_change_percentage_24h,
                    image: coin.image.large,
                };

                setCrypto(cryptoData);
                try {
                    localStorage.setItem(cacheKey, JSON.stringify(cryptoData));
                } catch (e) {
                    console.error("Failed to save crypto data to localStorage", e);
                }

            } catch (err: any) {
                console.error(`Failed to fetch data for ${cryptoId}:`, err.message);
                try {
                    const cachedDataRaw = localStorage.getItem(cacheKey);
                    if (cachedDataRaw) {
                        const cachedData = JSON.parse(cachedDataRaw);
                        setCrypto(cachedData);
                    } else {
                        setError(`Could not load data for ${cryptoId}. Please try again later.`);
                    }
                } catch (e) {
                     console.error("Failed to load crypto data from localStorage", e);
                     setError(`Could not load data for ${cryptoId}. Please try again later.`);
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (cryptoId) {
            fetchCryptoData();
        } else {
            setError("No crypto ID provided.");
            setIsLoading(false);
        }
    }, [cryptoId]);

    if (isLoading) {
        return <DetailPageSkeleton />;
    }

    if (error) {
        return (
            <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
                <h1 className="text-2xl font-bold text-destructive mb-4">An Error Occurred</h1>
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={() => router.push('/')} className="mt-6">Go to Homepage</Button>
            </div>
        )
    }

    if (!crypto) {
        return (
             <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
                <h1 className="text-2xl font-bold text-destructive mb-4">Cryptocurrency Not Found</h1>
                 <p className="text-muted-foreground">The cryptocurrency with ID "{cryptoId}" could not be found.</p>
                <Button onClick={() => router.push('/')} className="mt-6">Go to Homepage</Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex items-center gap-4 mb-8">
                <CryptoIcon id={crypto.id} symbol={crypto.symbol} image={crypto.image} name={crypto.name} size={48} />
                <div>
                    <h1 className="text-4xl font-bold">{crypto.name}</h1>
                    <p className="text-2xl text-muted-foreground">{crypto.symbol}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Price</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold font-mono">{formatCurrency(crypto.price, crypto.price < 1)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">24h Change</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {crypto.change24h != null ? (
                            <div className={cn(
                            "flex items-baseline gap-2 text-3xl font-bold", 
                            crypto.change24h >= 0 ? "text-chart-2" : "text-destructive"
                            )}>
                                {crypto.change24h >= 0 ? <ArrowUp className="h-6 w-6" /> : <ArrowDown className="h-6 w-6" />}
                                <span>{Math.abs(crypto.change24h).toFixed(2)}%</span>
                            </div>
                        ) : (
                            <p className="text-3xl font-bold text-muted-foreground">N/A</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Market Cap</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold font-mono">{formatNumber(crypto.marketCap)}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Market Cap Rank</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">#{crypto.rank}</p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2">
                    <ChartWrapper
                        cryptoId={crypto.id}
                        cryptoName={crypto.name}
                        cryptoSymbol={crypto.symbol}
                    />
                 </div>
                 <div className="lg:col-span-1">
                    <ChatBox cryptoId={crypto.id} />
                 </div>
            </div>
        </div>
    );
}
