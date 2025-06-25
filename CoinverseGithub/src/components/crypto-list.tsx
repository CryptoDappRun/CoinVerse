
"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Cryptocurrency } from '@/types';
import { getTop100Cryptos } from '@/lib/coingecko';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from './ui/skeleton';
import CryptoIcon from './crypto-icon';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: value < 1 ? 8 : 2,
    }).format(value);
};

const formatMarketCap = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 2,
    }).format(value);
};

export function CryptoList() {
    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState<Cryptocurrency[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [priceChanges, setPriceChanges] = useState<Record<string, 'up' | 'down'>>({});
    const prevPricesRef = useRef<Map<string, number>>(new Map());
    const router = useRouter();

    useEffect(() => {
        const initialLoad = async () => {
            setIsLoading(true);
            let loadedFromCache = false;
            // Try cache first
            try {
                const cachedDataRaw = localStorage.getItem('cryptoData');
                if (cachedDataRaw) {
                    const cachedData = JSON.parse(cachedDataRaw) as Cryptocurrency[];
                    if(cachedData.length > 0) {
                        setData(cachedData);
                        prevPricesRef.current = new Map(cachedData.map(c => [c.id, c.price]));
                        loadedFromCache = true;
                    }
                }
            } catch (error) {
                console.error("Failed to load or parse cached crypto data:", error);
            }

            // If not loaded from cache, fetch from API
            if (!loadedFromCache) {
                const newData = await getTop100Cryptos();
                if (newData.length > 0) {
                    setData(newData);
                    prevPricesRef.current = new Map(newData.map(c => [c.id, c.price]));
                    try {
                        localStorage.setItem('cryptoData', JSON.stringify(newData));
                    } catch (e) {
                        console.error("Failed to save to localStorage", e);
                    }
                }
            }
            setIsLoading(false);
        };

        initialLoad();

        const updateData = async () => {
            const newData = await getTop100Cryptos();
            
            if (newData.length > 0) {
                try {
                    localStorage.setItem('cryptoData', JSON.stringify(newData));
                } catch(e) {
                    console.error("Failed to save crypto data to localStorage", e);
                }

                const changes: Record<string, 'up' | 'down'> = {};
                const newPrices = new Map<string, number>();

                newData.forEach(coin => {
                    const prevPrice = prevPricesRef.current.get(coin.id);
                    if (prevPrice !== undefined && coin.price !== prevPrice) {
                        changes[coin.id] = coin.price > prevPrice ? 'up' : 'down';
                    }
                    newPrices.set(coin.id, coin.price);
                });
                
                setData(newData);
                setPriceChanges(changes);
                prevPricesRef.current = newPrices;
                
                setTimeout(() => setPriceChanges({}), 500);

            } else {
                console.error("Fetch failed, using stale or cached data.");
            }
        };

        const intervalId = setInterval(updateData, 30000);

        return () => clearInterval(intervalId);
    }, []);


    const filteredData = useMemo(() => {
        if (!searchQuery) return data;
        return data.filter(
            (crypto) =>
                crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [data, searchQuery]);

    if (isLoading) {
        return (
            <>
                <div className="relative mb-6">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or symbol..."
                        className="w-full pl-12 h-12 text-base"
                        value={searchQuery}
                        disabled
                    />
                </div>
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[50px] text-center">#</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right hidden md:table-cell">24h %</TableHead>
                                <TableHead className="text-right hidden sm:table-cell">Market Cap</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 10 }).map((_, i) => (
                                <TableRow key={i} className="hover:bg-transparent">
                                    <TableCell className="text-center"><Skeleton className="h-5 w-5 mx-auto" /></TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                            <div>
                                                <Skeleton className="h-5 w-24" />
                                                <Skeleton className="h-4 w-12 mt-1" />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                    <TableCell className="hidden md:table-cell text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                    <TableCell className="hidden sm:table-cell text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </>
        )
    }

    return (
        <>
            <div className="relative mb-6">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search by name or symbol..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 h-12 text-base"
                />
            </div>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[50px] text-center">#</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right hidden md:table-cell">24h %</TableHead>
                            <TableHead className="text-right hidden sm:table-cell">Market Cap</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.map((crypto) => (
                            <TableRow 
                                key={crypto.id} 
                                onClick={() => router.push(`/crypto/${crypto.id}`)} 
                                className={cn('cursor-pointer transition-colors', {
                                    'price-up': priceChanges[crypto.id] === 'up',
                                    'price-down': priceChanges[crypto.id] === 'down',
                                })}
                            >
                               <TableCell className="text-center text-muted-foreground font-medium">
                                   {crypto.rank}
                               </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <CryptoIcon id={crypto.id} symbol={crypto.symbol} image={crypto.image} name={crypto.name} size={32} />
                                        <div>
                                            <p className="font-bold">{crypto.name}</p>
                                            <p className="text-muted-foreground">{crypto.symbol}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <span className="font-mono rounded-md px-1 py-0.5">
                                        {formatCurrency(crypto.price)}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right hidden md:table-cell">
                                    {crypto.change24h != null ? (
                                        <div className={cn(
                                            "flex items-center justify-end gap-1 font-mono",
                                            crypto.change24h >= 0 ? "text-chart-2" : "text-destructive"
                                        )}>
                                            {crypto.change24h >= 0 ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>}
                                            <span>{Math.abs(crypto.change24h).toFixed(2)}%</span>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">N/A</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right hidden sm:table-cell font-mono">
                                    {formatMarketCap(crypto.marketCap)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
