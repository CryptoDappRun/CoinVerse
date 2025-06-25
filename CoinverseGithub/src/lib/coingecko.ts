import type { Cryptocurrency } from '@/types';

export async function getTop100Cryptos(): Promise<Cryptocurrency[]> {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false');
    if (!response.ok) {
      console.error(`Failed to fetch crypto data: ${response.statusText}`);
      return [];
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
        console.error("Fetched data is not an array");
        return [];
    };

    return data.map((coin: any) => ({
      id: coin.id,
      rank: coin.market_cap_rank,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      price: coin.current_price,
      marketCap: coin.market_cap,
      change24h: coin.price_change_percentage_24h,
      image: coin.image,
    }));
  } catch (error) {
    console.error("Error fetching top 100 cryptos:", error);
    return [];
  }
}
