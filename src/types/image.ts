
export interface ImageItem {
  id: string;
  name: string;
  url: string;
  filePath?: string; // Add file path property to store original file location
  rating: number;
  matches: number;
}

export interface ComparisonResult {
  winnerId: string;
  loserId: string;
  timestamp: number;
}
