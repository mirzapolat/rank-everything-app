import React, { useEffect, useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageItem } from "@/types/image";
import { updateRatings } from "@/utils/elo";
import { saveImagesToLocalStorage, saveComparisonResult, getComparisonResults, removeLastComparisonResult } from "@/utils/imageStorage";
import { toast } from "sonner";
import { Undo2 } from "lucide-react";

interface ComparisonArenaProps {
  images: ImageItem[];
  onRatingsUpdated: (updatedImages: ImageItem[]) => void;
  onReset: () => void;
  needsImageFiles?: boolean;
  hasImagesWithFiles?: boolean;
}

const ComparisonArena: React.FC<ComparisonArenaProps> = ({ 
  images, 
  onRatingsUpdated,
  onReset,
  needsImageFiles = false,
  hasImagesWithFiles = true
}) => {
  const [imageA, setImageA] = useState<ImageItem | null>(null);
  const [imageB, setImageB] = useState<ImageItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalComparisons, setTotalComparisons] = useState<number>(0);
  const [preloadedImages, setPreloadedImages] = useState<Map<string, HTMLImageElement>>(new Map());
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [lastComparisonPair, setLastComparisonPair] = useState<{winner: ImageItem, loser: ImageItem} | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if undo is available on mount
  useEffect(() => {
    const results = getComparisonResults();
    setCanUndo(results.length > 0);
    setTotalComparisons(results.length);
  }, []);

  // Preload all images initially and when images change
  useEffect(() => {
    if (images.length >= 2 && hasImagesWithFiles) {
      const preloadImages = async () => {
        const imageMap = new Map<string, HTMLImageElement>();
        
        // Create an array of promises for preloading
        const preloadPromises = images.map(img => {
          if (img.url && img.url !== "#placeholder") {
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
  }, [images, hasImagesWithFiles]);
  
  // Select random pair, efficiently using preloaded images
  const selectRandomPair = useCallback((imagesList: ImageItem[]) => {
    if (imagesList.length < 2 || !hasImagesWithFiles) {
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
  }, [hasImagesWithFiles]);

  // Initial selection of images
  useEffect(() => {
    if (images.length >= 2 && hasImagesWithFiles) {
      selectRandomPair(images);
    } else {
      // Clear any selected images if we don't have image files
      setImageA(null);
      setImageB(null);
    }
  }, [images, selectRandomPair, hasImagesWithFiles]);

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isLoading || !imageA || !imageB || !hasImagesWithFiles || needsImageFiles) return;

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
  }, [imageA, imageB, isLoading, hasImagesWithFiles, needsImageFiles]);

  const handleSelection = (selected: "A" | "B") => {
    if (!imageA || !imageB || isLoading || !hasImagesWithFiles) return;

    const winner = selected === "A" ? imageA : imageB;
    const loser = selected === "A" ? imageB : imageA;
    
    // Store this pair as the last comparison for undo
    setLastComparisonPair({ winner, loser });

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

    // Save the comparison result with both image IDs
    saveComparisonResult({
      winnerId: winner.id,
      loserId: loser.id,
      timestamp: Date.now()
    });

    // Enable undo after making a comparison
    setCanUndo(true);

    // Save updated images to storage
    saveImagesToLocalStorage(updatedImages);
    
    // Notify parent component
    onRatingsUpdated(updatedImages);
    
    // Update comparison count
    const newTotal = totalComparisons + 1;
    setTotalComparisons(newTotal);
    
    // Check for milestones
    const milestones = [10, 20, 50, 100, 200, 500, 1000];
    const milestone = milestones.find(m => newTotal === m);
    if (milestone) {
      toast.success(`Milestone reached: ${milestone} comparisons completed! 🎉`);
    } else if (newTotal % 50 === 0 && newTotal > 0) {
      // Show notification every 50 comparisons for higher numbers
      toast.info(`You've completed ${newTotal} comparisons!`);
    }
    
    // Immediate update to next pair
    selectRandomPair(updatedImages);
  };

  const handleUndo = () => {
    // Get the last comparison result
    const lastResult = removeLastComparisonResult();
    if (!lastResult) {
      setCanUndo(false);
      return;
    }
    
    // Find the winner and loser in the current images array
    const winner = images.find(img => img.id === lastResult.winnerId);
    const loser = images.find(img => img.id === lastResult.loserId);
    
    if (!winner || !loser) {
      toast.error("Could not find the images from the last comparison");
      return;
    }
    
    // Restore previous ratings by reverting the Elo calculation
    // We're using the reverse win (giving the win to the loser) to revert
    const [restoredLoserRating, restoredWinnerRating] = updateRatings(
      loser.rating,
      winner.rating,
      true
    );
    
    // Update image objects
    const updatedImages = images.map(img => {
      if (img.id === winner.id) {
        return { 
          ...img, 
          rating: restoredWinnerRating, 
          matches: Math.max(0, img.matches - 1)
        };
      }
      if (img.id === loser.id) {
        return { 
          ...img, 
          rating: restoredLoserRating, 
          matches: Math.max(0, img.matches - 1) 
        };
      }
      return img;
    });
    
    // Check if we can still undo after this operation
    const remainingResults = getComparisonResults();
    setCanUndo(remainingResults.length > 0);
    setTotalComparisons(remainingResults.length);
    
    // Save updated images to storage
    saveImagesToLocalStorage(updatedImages);
    
    // Notify parent component
    onRatingsUpdated(updatedImages);
    
    // Show these specific images for the rematch
    setImageA(winner);
    setImageB(loser);
    setIsLoading(false);
    
    toast.success("Last comparison undone. Make your choice again!");
  };

  // Show a message when image files are needed
  if (needsImageFiles) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted/20 border rounded-md">
        <h2 className="text-xl font-medium mb-2">Comparisons are paused</h2>
        <p className="text-center text-muted-foreground mb-4">
          Please select the image files that correspond to your imported data to continue.
        </p>
      </div>
    );
  }

  // Don't render the full UI if images don't have files
  if (!hasImagesWithFiles) {
    return null;
  }

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
      
      <div className="mt-6 text-center flex justify-center gap-4">
        {/* Undo button - only shown after at least one comparison */}
        {canUndo && (
          <Button
            onClick={handleUndo}
            variant="outline"
            className="text-sm gap-2"
            title="Undo last comparison"
          >
            <Undo2 size={18} />
            Undo Last
          </Button>
        )}
        
        <Button 
          onClick={() => selectRandomPair(images)}
          variant="outline"
          disabled={isLoading}
          className="text-sm"
        >
          Skip this pair
        </Button>
        
        <Button
          onClick={onReset}
          variant="outline"
          className="text-sm text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          Reset All Data
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
