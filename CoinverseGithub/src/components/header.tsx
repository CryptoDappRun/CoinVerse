"use client";

import Link from 'next/link';
import AuthButton from './auth-button';

const Logo = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2C8.26801 2 2 8.26801 2 16C2 23.732 8.26801 30 16 30C23.732 30 30 23.732 30 16C30 8.26801 23.732 2 16 2Z" fill="url(#paint0_linear_1_2)"/>
        <path d="M19.9999 10.5H14.4999C13.0425 10.5 12.0833 11.75 12.4166 13.125L14.0833 19.625C14.4166 21 15.5416 21.875 16.8333 21.5L20.2499 20.375C21.4166 20.0833 22.1666 18.875 21.7499 17.75L19.9999 10.5Z" fill="white" fillOpacity="0.8"/>
        <path d="M12.0834 13.125L10.2501 20.25C9.83341 21.375 10.5834 22.5833 11.7501 22.875L15.1667 24C16.4584 24.375 17.5834 23.5 17.9167 22.125L19.5834 15.625C19.9167 14.25 18.9584 13 17.5001 13H12.0001C12.0417 13.0417 12.0834 13.0833 12.0834 13.125Z" fill="white"/>
        <defs>
            <linearGradient id="paint0_linear_1_2" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
                <stop stopColor="#9D4EDD"/>
                <stop offset="1" stopColor="#C77DFF"/>
            </linearGradient>
        </defs>
    </svg>
)


const Header = () => {
    return (
        <header className="py-4 px-4 md:px-8 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <Logo />
                    <h1 className="text-2xl font-bold text-foreground">Coinverse</h1>
                </Link>
                <AuthButton />
            </div>
        </header>
    );
};

export default Header;
