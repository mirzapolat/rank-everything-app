
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageItem } from "@/types/image";
import { getImagesFromLocalStorage, resetAllData } from "@/utils/imageStorage";
import { toast } from "sonner";
import Header from "@/components/Header";
import ImageUploader from "@/components/ImageUploader";
import ComparisonArena from "@/components/ComparisonArena";
import RankingsList from "@/components/RankingsList";
import ResetDialog from "@/components/ResetDialog";

const Index = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [resetDialogOpen, setResetDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    // Load saved images from localStorage on component mount
    const savedImages = getImagesFromLocalStorage();
    setImages(savedImages);
    
    // If there are images, default to the compare tab
    if (savedImages.length >= 2) {
      setActiveTab("compare");
    }
  }, []);

  const handleImagesAdded = (updatedImages: ImageItem[]) => {
    setImages(updatedImages);
    
    // Automatically switch to compare tab if we now have enough images
    if (updatedImages.length >= 2) {
      setActiveTab("compare");
    }
  };

  const handleRatingsUpdated = (updatedImages: ImageItem[]) => {
    setImages(updatedImages);
  };

  const handleReset = () => {
    resetAllData();
    setImages([]);
    setActiveTab("upload");
    setResetDialogOpen(false);
    toast.success("All images and rankings have been reset");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        imageCount={images.length}
      />
      
      <main className="container max-w-6xl mx-auto px-4 pb-16">
        {/* Tab content */}
        <div className="mt-8">
          {activeTab === "upload" && (
            <div className="space-y-8">
              <ImageUploader onImagesAdded={handleImagesAdded} />
              
              {images.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-center">
                    {images.length} Image{images.length !== 1 ? 's' : ''} Uploaded
                  </h2>
                  <div className="flex justify-center">
                    <Button 
                      onClick={() => setActiveTab("compare")}
                      className="bg-teal hover:bg-teal-dark transition-colors"
                    >
                      Start Comparing
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === "compare" && (
            <ComparisonArena 
              images={images} 
              onRatingsUpdated={handleRatingsUpdated} 
            />
          )}
          
          {activeTab === "rankings" && (
            <RankingsList images={images} />
          )}
        </div>
        
        {/* Reset button */}
        {images.length > 0 && (
          <div className="mt-12 text-center">
            <Button
              variant="outline"
              onClick={() => setResetDialogOpen(true)}
              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              Reset All Data
            </Button>
          </div>
        )}
      </main>
      
      <ResetDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        onConfirm={handleReset}
      />
    </div>
  );
};

export default Index;
