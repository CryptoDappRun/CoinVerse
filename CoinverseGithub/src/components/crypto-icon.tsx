"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';

type CryptoIconProps = {
    id: string;
    symbol: string;
    name: string;
    image: string;
    size?: number;
};

export default function CryptoIcon({ id, symbol, name, image, size = 32 }: CryptoIconProps) {
    const localSrc = `/images/${id}.png`;
    const [currentSrc, setCurrentSrc] = useState(localSrc);
    const [hasFinalError, setHasFinalError] = useState(false);

    useEffect(() => {
        // Reset state to local path if component receives new props
        setCurrentSrc(`/images/${id}.png`);
        setHasFinalError(false);
    }, [id, image]);

    const handleImageError = () => {
        if (currentSrc === localSrc) {
            // 1. Local failed, try remote (CoinGecko)
            setCurrentSrc(image);
        } else {
            // 2. Remote also failed, show fallback div
            setHasFinalError(true);
        }
    };
    
    if (hasFinalError) {
        return (
            <div 
                className="rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold"
                style={{ width: size, height: size, fontSize: size / 2 }}
            >
                {symbol.slice(0, 1)}
            </div>
        );
    }

    return (
        <Image 
            src={currentSrc} 
            alt={`${name} logo`} 
            width={size} 
            height={size} 
            className="rounded-full"
            onError={handleImageError} 
        />
    );
}
