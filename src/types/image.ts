
export interface ImageItem {
  id: string;
  name: string;
  url: string;
  rating: number;
  matches: number;
}

export interface ComparisonResult {
  winnerId: string;
  loserId: string;
  timestamp: number;
}
