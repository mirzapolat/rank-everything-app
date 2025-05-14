
import React, { useEffect, useState, useRef, useCallback } from "react";
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
  const [preloadedImages, setPreloadedImages] = useState<Map<string, HTMLImageElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  // Preload all images initially and when images change
  useEffect(() => {
    if (images.length >= 2) {
      const preloadImages = async () => {
        const imageMap = new Map<string, HTMLImageElement>();
        
        // Create an array of promises for preloading
        const preloadPromises = images.map(img => {
          if (img.url) {
            return new Promise<void>((resolve) => {
              const imgElement = new Image();
              imgElement.onload = () => {
                imageMap.set(img.id, imgElement);
                resolve();
              };
              imgElement.onerror = () => {
                // Handle error but still resolve to avoid blocking
                console.error(`Failed to load image: ${img.url}`);
                resolve();
              };
              imgElement.src = img.url;
            });
          }
          return Promise.resolve();
        });
        
        // Wait for a batch of images to preload before setting state
        // This improves perceived performance for large sets
        await Promise.all(preloadPromises);
        
        setPreloadedImages(imageMap);
      };
      
      preloadImages();
    }
  }, [images]);
  
  // Select random pair, efficiently using preloaded images
  const selectRandomPair = useCallback((imagesList: ImageItem[]) => {
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
    
    // Set both images simultaneously
    Promise.all([
      imagesList[indexA],
      imagesList[indexB]
    ]).then(([imgA, imgB]) => {
      setImageA(imgA);
      setImageB(imgB);
      setIsLoading(false);
    });
  }, []);

  // Initial selection of images
  useEffect(() => {
    if (images.length >= 2) {
      selectRandomPair(images);
    }
  }, [images, selectRandomPair]);

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

  const handleSelection = (selected: "A" | "B") => {
    if (!imageA || !imageB || isLoading) return;

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
    
    // Immediate update to next pair
    selectRandomPair(updatedImages);
    
    if (totalComparisons > 0 && totalComparisons % 20 === 0) {
      toast.info(`You've completed ${totalComparisons} comparisons!`);
    }
  };

  return (
    <div className="flex flex-col" ref={containerRef}>
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold">Which image do you prefer?</h2>
        <p className="text-muted-foreground">Click on the image you like better or press key <strong>1</strong> or <strong>2</strong></p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {/* Image A */}
        <Card 
          className={`overflow-hidden border-2 transition-colors
            hover:border-teal cursor-pointer
            ${!imageA || isLoading ? 'h-48 flex items-center justify-center' : ''}`
          }
          onClick={() => !isLoading && imageA && handleSelection("A")}
        >
          <div className="relative p-2 text-center font-bold text-muted-foreground">
            1
          </div>
          {imageA && !isLoading ? (
            <div className="relative h-[300px] md:h-[400px] w-full flex items-center justify-center bg-muted/20">
              <img 
                src={imageA.url} 
                alt={imageA.name}
                className="max-h-full max-w-full object-contain"
                draggable={false}
              />
            </div>
          ) : (
            <p className="text-muted-foreground">Loading image...</p>
          )}
        </Card>
        
        {/* Image B */}
        <Card 
          className={`overflow-hidden border-2 transition-colors
            hover:border-teal cursor-pointer
            ${!imageB || isLoading ? 'h-48 flex items-center justify-center' : ''}`
          }
          onClick={() => !isLoading && imageB && handleSelection("B")}
        >
          <div className="relative p-2 text-center font-bold text-muted-foreground">
            2
          </div>
          {imageB && !isLoading ? (
            <div className="relative h-[300px] md:h-[400px] w-full flex items-center justify-center bg-muted/20">
              <img 
                src={imageB.url} 
                alt={imageB.name}
                className="max-h-full max-w-full object-contain"
                draggable={false}
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
