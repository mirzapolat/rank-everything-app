
import React, { useState } from "react";
import { ImageItem } from "@/types/image";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { List, Grid2X2 } from "lucide-react";

interface RankingsListProps {
  images: ImageItem[];
}

const RankingsList: React.FC<RankingsListProps> = ({ images }) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const sortedImages = [...images].sort((a, b) => b.rating - a.rating);

  if (images.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p>No images have been ranked yet.</p>
      </Card>
    );
  }

  const renderGridView = () => (
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
                {Math.round(image.rating)} ELO
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
  );

  const renderListView = () => (
    <div className="space-y-2">
      {sortedImages.map((image, index) => (
        <Card key={image.id} className="overflow-hidden">
          <div className="flex items-center p-2">
            <div className="flex-shrink-0 mr-4 font-bold text-xl w-10 text-center">
              {index + 1}
            </div>
            
            <div className="h-16 w-16 flex-shrink-0 bg-muted overflow-hidden">
              <img 
                src={image.url} 
                alt={image.name}
                className="h-full w-full object-cover"
              />
            </div>
            
            <div className="flex-grow px-4">
              <p className="truncate" title={image.name}>
                {image.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {image.matches} comparisons
              </p>
            </div>
            
            <div className="flex-shrink-0 bg-muted px-3 py-1 rounded-full">
              {Math.round(image.rating)} ELO
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Image Rankings</h2>
        
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "grid" | "list")}>
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <Grid2X2 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      {viewMode === "grid" ? renderGridView() : renderListView()}
    </div>
  );
};

export default RankingsList;
