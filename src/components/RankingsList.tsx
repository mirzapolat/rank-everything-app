
import React from "react";
import { ImageItem } from "@/types/image";
import { Card } from "@/components/ui/card";

interface RankingsListProps {
  images: ImageItem[];
}

const RankingsList: React.FC<RankingsListProps> = ({ images }) => {
  const sortedImages = [...images].sort((a, b) => b.rating - a.rating);

  if (images.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p>No images have been ranked yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">Image Rankings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedImages.map((image, index) => (
          <Card key={image.id} className="overflow-hidden flex flex-col">
            <div className="relative h-40 overflow-hidden bg-muted">
              <img 
                src={image.url} 
                alt={image.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-medium">Rank #{index + 1}</span>
                <span className="text-sm px-2 py-1 bg-muted rounded-full">
                  {image.rating} ELO
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground truncate" title={image.name}>
                {image.name}
              </p>
              
              <p className="text-xs text-muted-foreground mt-1">
                {image.matches} match{image.matches !== 1 ? 'es' : ''}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RankingsList;
