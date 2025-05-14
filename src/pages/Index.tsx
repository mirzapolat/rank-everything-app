
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageItem } from "@/types/image";
import { 
  getImagesFromLocalStorage, 
  resetAllData, 
  exportDataToFile, 
  importDataFromFile 
} from "@/utils/imageStorage";
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
  const [importLoading, setImportLoading] = useState<boolean>(false);

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

  const handleExport = () => {
    if (images.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    try {
      exportDataToFile();
      toast.success("Data exported successfully");
    } catch (error) {
      toast.error("Failed to export data");
      console.error("Export error:", error);
    }
  };

  const handleImportClick = () => {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    fileInput.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        setImportLoading(true);
        try {
          const importedImages = await importDataFromFile(target.files[0]);
          setImages(importedImages);
          toast.success("Data imported successfully");
          
          if (importedImages.length >= 2) {
            setActiveTab("compare");
          }
        } catch (error) {
          toast.error("Failed to import data");
          console.error("Import error:", error);
        } finally {
          setImportLoading(false);
        }
      }
    };
    
    fileInput.click();
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
              <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                <Button 
                  onClick={handleExport}
                  variant="outline" 
                  className="w-full md:w-auto"
                  disabled={images.length === 0}
                >
                  Export Progress
                </Button>
                
                <Button 
                  onClick={handleImportClick}
                  variant="outline" 
                  className="w-full md:w-auto"
                  disabled={importLoading}
                >
                  {importLoading ? "Importing..." : "Import Progress"}
                </Button>
              </div>
              
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
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="w-full md:w-auto"
                  disabled={images.length === 0}
                >
                  Export Rankings
                </Button>
              </div>
              
              <RankingsList images={images} />
            </div>
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
