
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
  const [activeTab, setActiveTab] = useState<string>("home");
  const [resetDialogOpen, setResetDialogOpen] = useState<boolean>(false);
  const [importLoading, setImportLoading] = useState<boolean>(false);

  useEffect(() => {
    // Load saved images from localStorage on component mount
    const savedImages = getImagesFromLocalStorage();
    setImages(savedImages);
  }, []);

  const handleImagesAdded = (updatedImages: ImageItem[]) => {
    setImages(updatedImages);
  };

  const handleRatingsUpdated = (updatedImages: ImageItem[]) => {
    setImages(updatedImages);
  };

  const handleReset = () => {
    resetAllData();
    setImages([]);
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
          {activeTab === "home" && (
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
              
              {/* Only show uploader if there are no images or less than 2 */}
              {images.length < 2 && (
                <ImageUploader onImagesAdded={handleImagesAdded} />
              )}
              
              {/* Always show comparison arena on home tab if we have enough images */}
              {images.length >= 2 && (
                <ComparisonArena 
                  images={images} 
                  onRatingsUpdated={handleRatingsUpdated} 
                />
              )}
            </div>
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
