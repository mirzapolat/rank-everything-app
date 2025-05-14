
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageItem } from "@/types/image";
import { updateRatings } from "@/utils/elo";
import { saveImagesToLocalStorage, saveComparisonResult } from "@/utils/imageStorage";
import { toast } from "sonner";

interface ComparisonArenaProps {
  images: ImageItem[];
  onRatingsUpdated: (updatedImages: ImageItem[]) => void;
}

const ComparisonArena: React.FC<ComparisonArenaProps> = ({ 
  images, 
  onRatingsUpdated 
}) => {
  const [imageA, setImageA] = useState<ImageItem | null>(null);
  const [imageB, setImageB] = useState<ImageItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalComparisons, setTotalComparisons] = useState<number>(0);

  useEffect(() => {
    if (images.length >= 2) {
      selectRandomPair(images);
    }
  }, [images]);

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isLoading || !imageA || !imageB) return;

      if (event.key === "1") {
        handleSelection("A");
      } else if (event.key === "2") {
        handleSelection("B");
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [imageA, imageB, isLoading]);

  const selectRandomPair = (imagesList: ImageItem[]) => {
    if (imagesList.length < 2) {
      setImageA(null);
      setImageB(null);
      return;
    }

    setIsLoading(true);
    
    // Select two random, different images
    let indexA = Math.floor(Math.random() * imagesList.length);
    let indexB;
    
    do {
      indexB = Math.floor(Math.random() * imagesList.length);
    } while (indexB === indexA);
    
    // Load images immediately without animation delay
    setImageA(imagesList[indexA]);
    setImageB(imagesList[indexB]);
    setIsLoading(false);
  };

  const handleSelection = (selected: "A" | "B") => {
    if (!imageA || !imageB) return;

    const winner = selected === "A" ? imageA : imageB;
    const loser = selected === "A" ? imageB : imageA;

    // Calculate new Elo ratings
    const [newWinnerRating, newLoserRating] = updateRatings(
      winner.rating,
      loser.rating,
      true
    );

    // Update image objects
    const updatedImages = images.map(img => {
      if (img.id === winner.id) {
        return { 
          ...img, 
          rating: newWinnerRating, 
          matches: img.matches + 1 
        };
      }
      if (img.id === loser.id) {
        return { 
          ...img, 
          rating: newLoserRating, 
          matches: img.matches + 1 
        };
      }
      return img;
    });

    // Save the comparison result
    saveComparisonResult({
      winnerId: winner.id,
      loserId: loser.id,
      timestamp: Date.now()
    });

    // Save updated images to storage
    saveImagesToLocalStorage(updatedImages);
    
    // Notify parent component
    onRatingsUpdated(updatedImages);
    
    // Update comparison count
    setTotalComparisons(prev => prev + 1);
    
    // Select a new pair
    selectRandomPair(updatedImages);
    
    if (totalComparisons > 0 && totalComparisons % 10 === 0) {
      toast.info(`You've completed ${totalComparisons} comparisons!`);
    }
  };

  if (images.length < 2) {
    return (
      <Card className="p-6 text-center bg-muted/30">
        <p className="mb-2">Please upload at least 2 images to begin comparing.</p>
        <p className="text-sm text-muted-foreground">
          Images will be shown here side-by-side for you to rank.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold">Which image do you prefer?</h2>
        <p className="text-muted-foreground">Click on the image you like better or press key <strong>1</strong> or <strong>2</strong></p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {/* Image A */}
        <Card 
          className={`overflow-hidden border-2 transition-colors
            ${isLoading ? 'opacity-0' : 'opacity-100 hover:border-teal cursor-pointer'}
            ${!imageA ? 'h-48 flex items-center justify-center' : ''}`
          }
          onClick={() => !isLoading && imageA && handleSelection("A")}
        >
          <div className="relative p-2 text-center font-bold text-muted-foreground">
            1
          </div>
          {imageA ? (
            <div className="relative h-[300px] md:h-[400px] w-full">
              <img 
                src={imageA.url} 
                alt={imageA.name}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
          ) : (
            <p className="text-muted-foreground">Loading image...</p>
          )}
        </Card>
        
        {/* Image B */}
        <Card 
          className={`overflow-hidden border-2 transition-colors
            ${isLoading ? 'opacity-0' : 'opacity-100 hover:border-teal cursor-pointer'}
            ${!imageB ? 'h-48 flex items-center justify-center' : ''}`
          }
          onClick={() => !isLoading && imageB && handleSelection("B")}
        >
          <div className="relative p-2 text-center font-bold text-muted-foreground">
            2
          </div>
          {imageB ? (
            <div className="relative h-[300px] md:h-[400px] w-full">
              <img 
                src={imageB.url} 
                alt={imageB.name}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
          ) : (
            <p className="text-muted-foreground">Loading image...</p>
          )}
        </Card>
      </div>
      
      <div className="mt-6 text-center">
        <Button 
          onClick={() => selectRandomPair(images)}
          variant="outline"
          disabled={isLoading}
          className="text-sm"
        >
          Skip this pair
        </Button>
      </div>
      
      {totalComparisons > 0 && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {totalComparisons} comparison{totalComparisons !== 1 ? 's' : ''} completed
        </div>
      )}
    </div>
  );
};

export default ComparisonArena;
