"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';
import type { Indicator } from './kline-chart';
import { ScrollArea } from './ui/scroll-area';

type IndicatorConfig = {
    name: string;
    fullName: string;
    defaultParams: number[];
    paramNames: string[];
    isOverlay: boolean;
};

const availableIndicators: IndicatorConfig[] = [
    { name: 'MA', fullName: 'Moving Average', defaultParams: [5, 10, 30], paramNames: ['P1', 'P2', 'P3'], isOverlay: true },
    { name: 'EMA', fullName: 'Exponential Moving Average', defaultParams: [6, 12, 20], paramNames: ['P1', 'P2', 'P3'], isOverlay: true },
    { name: 'BOLL', fullName: 'Bollinger Bands', defaultParams: [20, 2], paramNames: ['Period', 'StdDev'], isOverlay: true },
    { name: 'BBI', fullName: 'Bull and Bear Index', defaultParams: [3, 6, 12, 24], paramNames: ['P1', 'P2', 'P3', 'P4'], isOverlay: true },
    { name: 'VOL', fullName: 'Volume', defaultParams: [], paramNames: [], isOverlay: false },
    { name: 'MACD', fullName: 'MACD', defaultParams: [12, 26, 9], paramNames: ['Short', 'Long', 'Period'], isOverlay: false },
    { name: 'RSI', fullName: 'Relative Strength Index', defaultParams: [6, 12, 24], paramNames: ['P1', 'P2', 'P3'], isOverlay: false },
    { name: 'KDJ', fullName: 'Stochastic Oscillator', defaultParams: [9, 3, 3], paramNames: ['K', 'D', 'J'], isOverlay: false },
];

type IndicatorState = {
    [key: string]: {
        active: boolean;
        params: (number | string)[];
    }
}

interface IndicatorSettingsProps {
    activeIndicators: Indicator[];
    onApply: (indicators: Indicator[]) => void;
}

export default function IndicatorSettings({ activeIndicators, onApply }: IndicatorSettingsProps) {
    const [open, setOpen] = useState(false);
    const [settings, setSettings] = useState<IndicatorState>({});

    useEffect(() => {
        if (open) {
            const initialState: IndicatorState = {};
            availableIndicators.forEach(ind => {
                const activeIndicator = activeIndicators.find(a => a.name === ind.name);
                initialState[ind.name] = {
                    active: !!activeIndicator,
                    params: activeIndicator?.calcParams ?? ind.defaultParams,
                };
            });
            setSettings(initialState);
        }
    }, [open, activeIndicators]);


    const handleSwitchChange = (name: string, checked: boolean) => {
        setSettings(prev => ({
            ...prev,
            [name]: { ...prev[name], active: checked },
        }));
    };

    const handleParamChange = (name: string, paramIndex: number, value: string) => {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue)) return;

        setSettings(prev => {
            const newParams = [...prev[name].params];
            newParams[paramIndex] = numValue;
            return {
                ...prev,
                [name]: { ...prev[name], params: newParams },
            };
        });
    };

    const handleApply = () => {
        const newIndicators: Indicator[] = [];
        for (const ind of availableIndicators) {
            if (settings[ind.name]?.active) {
                newIndicators.push({
                    name: ind.name,
                    calcParams: settings[ind.name].params.length > 0 ? settings[ind.name].params : undefined,
                });
            }
        }
        onApply(newIndicators);
        setOpen(false);
    };
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Indicator Settings</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Indicator Settings</DialogTitle>
                    <DialogDescription>
                        Select indicators to display on the chart and customize their parameters.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[400px] pr-6">
                    <div className="space-y-6 py-4">
                        {availableIndicators.map((indicator) => (
                            <div key={indicator.name} className="flex flex-col gap-4 p-1">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor={`switch-${indicator.name}`} className="text-base">
                                        {indicator.fullName} ({indicator.name})
                                    </Label>
                                    <Switch
                                        id={`switch-${indicator.name}`}
                                        checked={settings[indicator.name]?.active ?? false}
                                        onCheckedChange={(checked) => handleSwitchChange(indicator.name, checked)}
                                    />
                                </div>
                                {settings[indicator.name]?.active && indicator.paramNames.length > 0 && (
                                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pl-2">
                                        {indicator.paramNames.map((paramName, index) => (
                                            <div key={paramName} className="grid gap-1">
                                                <Label htmlFor={`param-${indicator.name}-${index}`} className="text-xs text-muted-foreground">{paramName}</Label>
                                                <Input
                                                    id={`param-${indicator.name}-${index}`}
                                                    type="number"
                                                    value={settings[indicator.name]?.params[index] ?? ''}
                                                    onChange={(e) => handleParamChange(indicator.name, index, e.target.value)}
                                                    className="h-8"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button onClick={handleApply}>Apply Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
