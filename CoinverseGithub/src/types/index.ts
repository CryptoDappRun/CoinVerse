export interface Cryptocurrency {
  id: string;
  rank: number;
  name: string;
  symbol: string;
  price: number;
  marketCap: number;
  change24h: number | null;
  image: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  timestamp: any;
  userId: string;
  userName: string;
}
