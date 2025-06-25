"use client";

import { useLayoutEffect, useRef } from 'react';
import { init, dispose, type KLineData } from 'klinecharts';

const getChartStyleOptions = () => {
    const root = document.documentElement;
    const getCssVar = (name: string) => `hsla(${getComputedStyle(root).getPropertyValue(name)})`;
    const border = getCssVar('--border');

    return {
        grid: { show: true, horizontal: { show: true, size: 1, color: border, style: 'dashed', }, vertical: { show: false, } },
        candle: {
            priceMark: { high: { color: getCssVar('--foreground') }, low: { color: getCssVar('--foreground') } },
            tooltip: { showRule: 'follow_cross', showType: 'standard', labels: ['Time:', 'Open:', 'Close:', 'High:', 'Low:', 'Volume:'] }
        },
        technicalIndicator: {
            bar: { upColor: getCssVar('--chart-2'), downColor: getCssVar('--destructive'), noChangeColor: getCssVar('--foreground') },
            line: { colors: [getCssVar('--primary'), getCssVar('--accent'), getCssVar('--secondary-foreground'), '#f1c40f', '#e67e22'] }
        },
        xAxis: { tickLine: { show: false }, tickText: { paddingTop: 5 } },
        yAxis: { tickText: { paddingLeft: 5 } },
        separator: { color: border },
        crosshair: { horizontal: { line: { style: 'dashed' } }, vertical: { line: { style: 'dashed' } } }
    };
}

export interface Indicator {
  name: string;
  calcParams?: (number | string)[];
}

export default function KlineChart({ data, indicators = [] }: { data: KLineData[], indicators?: Indicator[] }) {
  const chartRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!chartRef.current) {
      return;
    }

    // Dispose of previous chart instance before creating a new one
    dispose(chartRef.current);

    if (!data || data.length === 0) {
      return;
    }
    
    const chart = init(chartRef.current, { theme: 'dark' });
    if (!chart) return;

    chart.setStyles(getChartStyleOptions());

    indicators.forEach(indicator => {
        const isOverlay = ['MA', 'EMA', 'SMA', 'BBI', 'BOLL'].includes(indicator.name);
        try {
            chart.createIndicator(indicator.name, !isOverlay, { calcParams: indicator.calcParams });
        } catch (e) {
            console.error(`Failed to create indicator ${indicator.name}:`, e);
        }
    });

    chart.applyNewData(data);

    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(chartRef.current);
    
    return () => {
        resizeObserver.disconnect();
        // The dispose call at the beginning of the effect handles cleanup of the chart instance.
    };
  }, [data, indicators]);

  if (!data || data.length === 0) {
    return (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No historical price data available.
        </div>
    );
  }

  return <div ref={chartRef} className="w-full h-full" />;
}
