
import React, { useState, useEffect } from "react";
import { ImageItem } from "@/types/image";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { List, Grid2X2, Download, Minimize, ArrowLeft, ArrowRight, FileArchive } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider"; 
import ExportRankingsButton from "./ExportRankingsButton";

interface RankingsListProps {
  images: ImageItem[];
}

const RankingsList: React.FC<RankingsListProps> = ({ images }) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [cardSize, setCardSize] = useState<number>(300); // Larger default size
  const sortedImages = [...images].sort((a, b) => b.rating - a.rating);

  const selectedImage = selectedImageIndex !== null ? sortedImages[selectedImageIndex] : null;

  // Calculate the number of columns based on card size
  const getGridColumnsClass = () => {
    if (cardSize > 350) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-2";
    if (cardSize > 250) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    if (cardSize > 200) return "grid-cols-1 md:grid-cols-3 lg:grid-cols-4";
    return "grid-cols-2 md:grid-cols-3 lg:grid-cols-5"; // For smallest cards
  };

  useEffect(() => {
    // Handle keyboard navigation in fullscreen mode
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      
      switch (event.key) {
        case "ArrowLeft":
          // Go to previous image
          setSelectedImageIndex(prev => 
            prev !== null ? (prev > 0 ? prev - 1 : sortedImages.length - 1) : null
          );
          break;
        case "ArrowRight":
          // Go to next image
          setSelectedImageIndex(prev => 
            prev !== null ? (prev < sortedImages.length - 1 ? prev + 1 : 0) : null
          );
          break;
        case "Escape":
          // Close the modal
          setSelectedImageIndex(null);
          break;
      }
    };

    if (selectedImageIndex !== null) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImageIndex, sortedImages.length]);

  if (images.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p>No images have been ranked yet.</p>
      </Card>
    );
  }

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleNext = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((selectedImageIndex + 1) % sortedImages.length);
  };
  
  const handlePrevious = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : sortedImages.length - 1);
  };

  // Calculate image height based on card size, with a min/max range
  const getImageHeight = () => {
    // Image height is proportional to card size but with a reasonable min/max
    return Math.max(120, cardSize - 80); // Subtract space for metadata
  };

  const renderGridView = () => (
    <div className={`grid ${getGridColumnsClass()} gap-4`}>
      {sortedImages.map((image, index) => (
        <Card 
          key={image.id} 
          className="overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleImageClick(index)}
          style={{ 
            // Apply the card size to control the overall card size
            maxWidth: `${cardSize * 1.2}px`,
            width: '100%'
          }}
        >
          <div 
            className="relative overflow-hidden bg-muted" 
            style={{ height: `${getImageHeight()}px` }}
          >
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
          onClick={() => handleImageClick(index)}
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold">Image Rankings</h2>
      </div>
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Export as ZIP button on the left */}
        <div className="flex items-center gap-2">
          <ExportRankingsButton images={images} />
          
          {/* Export Progress button next to it */}
          <Button
            variant="outline"
            className="w-full md:w-auto"
            disabled={images.length === 0}
            onClick={() => {
              try {
                const link = document.createElement('a');
                const data = JSON.stringify(images, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                link.href = URL.createObjectURL(blob);
                link.download = `rankings_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              } catch (error) {
                console.error("Export error:", error);
              }
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Progress
          </Button>
        </div>

        {/* Card size slider in the middle */}
        <div className="flex-grow flex items-center gap-2 max-w-md mx-2">
          {viewMode === "grid" && (
            <div className="flex items-center gap-2 w-full">
              <span className="text-sm font-medium whitespace-nowrap">Size:</span>
              <Slider 
                value={[cardSize]} 
                onValueChange={([value]) => setCardSize(value)}
                min={180} 
                max={400}
                step={10}
                className="w-full"
              />
            </div>
          )}
        </div>
        
        {/* View toggle buttons on the right */}
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
      <Dialog open={selectedImage !== null} onOpenChange={(open) => !open && setSelectedImageIndex(null)}>
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
                  <Minimize className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </DialogClose>
            </div>
            
            {/* Navigation buttons */}
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handlePrevious}
              className="absolute left-4 z-10 bg-black/50 hover:bg-black/70 text-white border-none"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Previous image</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleNext}
              className="absolute right-4 z-10 bg-black/50 hover:bg-black/70 text-white border-none"
            >
              <ArrowRight className="h-4 w-4" />
              <span className="sr-only">Next image</span>
            </Button>
            
            {selectedImage && (
              <img
                src={selectedImage.url}
                alt={selectedImage.name}
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RankingsList;
