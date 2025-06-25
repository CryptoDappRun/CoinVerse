
"use client";

import { useState, useRef, useEffect } from 'react';
import { type KLineData } from 'klinecharts';
import KlineChart, { type Indicator } from './kline-chart';
import IndicatorSettings from './indicator-settings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from './ui/button';
import { Maximize, Minimize, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ChartWrapperProps = {
    cryptoId: string;
    cryptoName: string;
    cryptoSymbol: string;
}

const defaultIndicators: Indicator[] = [
    { name: 'MA', calcParams: [5, 10, 30] },
    { name: 'VOL' },
    { name: 'MACD', calcParams: [12, 26, 9] },
];

const LOCAL_STORAGE_KEY_INDICATORS = 'chart-indicator-settings';
type CoinGeckoOHLC = [number, number, number, number, number];


export default function ChartWrapper({ cryptoId, cryptoName, cryptoSymbol }: ChartWrapperProps) {
    const [indicators, setIndicators] = useState<Indicator[]>(defaultIndicators);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [historicalData, setHistoricalData] = useState<KLineData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY_INDICATORS);
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                if (Array.isArray(parsedSettings)) {
                    setIndicators(parsedSettings);
                }
            }
        } catch (error) {
            console.error("Failed to load indicator settings from localStorage", error);
            setIndicators(defaultIndicators);
        }
    }, []);

    useEffect(() => {
        const LOCAL_STORAGE_KEY_HISTORICAL = `historical-data-${cryptoId}`;

        const fetchData = async () => {
            setIsLoading(true);

            try {
                const cachedDataRaw = localStorage.getItem(LOCAL_STORAGE_KEY_HISTORICAL);
                if (cachedDataRaw) {
                    const cachedData = JSON.parse(cachedDataRaw);
                    if (Array.isArray(cachedData) && cachedData.length > 0) {
                        setHistoricalData(cachedData);
                    }
                }
            } catch (error) {
                console.error("Failed to load historical data from localStorage", error);
            }

            try {
                const response = await fetch(`https://api.coingecko.com/api/v3/coins/${cryptoId}/ohlc?vs_currency=usd&days=365`);
                if (!response.ok) {
                    console.error(`Failed to fetch historical data for ${cryptoId}: ${response.statusText}`);
                    return;
                }
                const data: CoinGeckoOHLC[] = await response.json();

                if (Array.isArray(data) && data.length > 0) {
                    const formattedData: KLineData[] = data.map(([timestamp, open, high, low, close]) => ({
                        timestamp,
                        open,
                        high,
                        low,
                        close,
                        volume: Math.random() * 1000000, 
                    }));

                    setHistoricalData(formattedData);

                    try {
                        localStorage.setItem(LOCAL_STORAGE_KEY_HISTORICAL, JSON.stringify(formattedData));
                    } catch (error) {
                        console.error("Failed to save historical data to localStorage", error);
                    }
                }
            } catch (error) {
                console.error(`Error fetching historical data for ${cryptoId}:`, error);
            } finally {
                setIsLoading(false);
            }
        };

        if (cryptoId) {
            fetchData();
        }
    }, [cryptoId]);


    const handleApplyIndicators = (newIndicators: Indicator[]) => {
        setIndicators(newIndicators);
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY_INDICATORS, JSON.stringify(newIndicators));
        } catch (error) {
            console.error("Failed to save indicator settings to localStorage", error);
        }
    };

    const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            chartContainerRef.current?.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    return (
        <Card ref={chartContainerRef} className={cn(
            "flex flex-col h-full", 
            isFullscreen && "bg-background fixed inset-0 z-[100] w-screen h-screen rounded-none border-none"
        )}>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Price Chart</CardTitle>
                    <CardDescription>Price history for {cryptoName} ({cryptoSymbol})</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <IndicatorSettings
                        activeIndicators={indicators}
                        onApply={handleApplyIndicators}
                    />
                    <Button variant="outline" size="icon" onClick={toggleFullscreen}>
                        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                        <span className="sr-only">{isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}</span>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 pl-0 pr-4 md:pr-6 pb-0">
                <div className={cn("w-full", isFullscreen ? "h-full" : "h-[500px]")}>
                    {isLoading ? (
                         <div className="flex h-full w-full items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <KlineChart data={historicalData} indicators={indicators} />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
