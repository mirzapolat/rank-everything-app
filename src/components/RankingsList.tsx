
import React, { useState } from "react";
import { ImageItem } from "@/types/image";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { List, Grid2X2, Download, Maximize2 } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogClose
} from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";

interface RankingsListProps {
  images: ImageItem[];
}

const RankingsList: React.FC<RankingsListProps> = ({ images }) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const sortedImages = [...images].sort((a, b) => b.rating - a.rating);

  if (images.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p>No images have been ranked yet.</p>
      </Card>
    );
  }

  const handleImageClick = (image: ImageItem) => {
    setSelectedImage(image);
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedImages.map((image, index) => (
        <Card 
          key={image.id} 
          className="overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleImageClick(image)}
        >
          <div className="relative h-52 overflow-hidden bg-muted">
            <div className="h-full w-full flex items-center justify-center">
              <img 
                src={image.url} 
                alt={image.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
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
        <Card 
          key={image.id} 
          className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleImageClick(image)}
        >
          <div className="flex items-center p-2">
            <div className="flex-shrink-0 mr-4 font-bold text-xl w-10 text-center">
              {index + 1}
            </div>
            
            <div className="h-16 w-16 flex-shrink-0 bg-muted overflow-hidden flex items-center justify-center">
              <img 
                src={image.url} 
                alt={image.name}
                className="max-h-full max-w-full object-contain"
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

      {/* Fullscreen Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-[90vw] w-auto max-h-[90vh] p-0 overflow-hidden">
          <div className="relative bg-black flex flex-col h-full">
            <div className="absolute right-2 top-2 z-10 flex gap-2">
              {selectedImage && (
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={() => selectedImage && handleDownload(selectedImage.url, selectedImage.name)}
                  className="bg-black/50 hover:bg-black/70 text-white border-none"
                >
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
              )}
              <DialogClose asChild>
                <Button 
                  size="icon" 
                  variant="outline"
                  className="bg-black/50 hover:bg-black/70 text-white border-none"
                >
                  <Maximize2 className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </DialogClose>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-4 h-full">
              {selectedImage && (
                <img
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>
            
            {selectedImage && (
              <div className="p-4 text-center bg-background">
                <h3 className="text-lg font-medium">{selectedImage.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Rank: {sortedImages.findIndex(img => img.id === selectedImage.id) + 1} • 
                  {Math.round(selectedImage.rating)} ELO • 
                  {selectedImage.matches} comparison{selectedImage.matches !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RankingsList;
