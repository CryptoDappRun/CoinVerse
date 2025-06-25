import { CryptoList } from '@/components/crypto-list';

export default function Home() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
        <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Top Cryptocurrencies</h1>
            <p className="text-muted-foreground mt-2">The top 100 cryptocurrencies by market cap</p>
        </div>
        <CryptoList />
    </div>
  );
}
