import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/header';
import { AuthProvider } from '@/components/auth-provider';

export const metadata: Metadata = {
  title: 'Coinverse',
  description: 'Monitor the top 100 cryptocurrencies in real-time.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <AuthProvider>
            <Header />
            <main className="flex-1">
            {children}
            </main>
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
