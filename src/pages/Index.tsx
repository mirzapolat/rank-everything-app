import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImageItem } from "@/types/image";
import { 
  getImagesFromLocalStorage, 
  resetAllData, 
  exportDataToFile, 
  importDataFromFile,
  updateImagesWithFiles
} from "@/utils/imageStorage";
import { toast } from "sonner";
import Header from "@/components/Header";
import ImageUploader from "@/components/ImageUploader";
import ComparisonArena from "@/components/ComparisonArena";
import RankingsList from "@/components/RankingsList";
import { Upload, Folder } from "lucide-react";
import { Card } from "@/components/ui/card";

const Index = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("home");
  const [resetDialogOpen, setResetDialogOpen] = useState<boolean>(false);
  const [importLoading, setImportLoading] = useState<boolean>(false);
  const [needsImageFiles, setNeedsImageFiles] = useState<boolean>(false);
  const [totalComparisons, setTotalComparisons] = useState<number>(0);
  const [imagesImported, setImagesImported] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load saved images from localStorage on component mount
    const savedImages = getImagesFromLocalStorage();
    setImages(savedImages);
    
    // Calculate total comparisons from images
    if (savedImages.length > 0) {
      // If we have images and at least one has matches, consider as imported
      const hasMatches = savedImages.some(img => img.matches > 0);
      setImagesImported(hasMatches);
      
      // Sum all matches and divide by 2 since each comparison affects 2 images
      const totalMatches = savedImages.reduce((sum, img) => sum + img.matches, 0);
      setTotalComparisons(totalMatches / 2);
    }
    
    // Listen for reset events from the Header component
    const handleResetEvent = () => {
      handleReset();
    };
    
    window.addEventListener('app:reset', handleResetEvent);
    
    return () => {
      window.removeEventListener('app:reset', handleResetEvent);
    };
  }, []);

  // Check if images have their URL (which means they have actual files)
  const hasImagesWithFiles = images.length >= 2 && images.every(image => 
    image.url && image.url !== "#placeholder"
  );

  const handleImagesAdded = (updatedImages: ImageItem[]) => {
    setImages(updatedImages);
    // Reset the needsImageFiles flag if we're directly adding images
    setNeedsImageFiles(false);
  };

  const handleRatingsUpdated = (updatedImages: ImageItem[]) => {
    setImages(updatedImages);
    // Update total comparisons when ratings change
    const totalMatches = updatedImages.reduce((sum, img) => sum + img.matches, 0);
    setTotalComparisons(totalMatches / 2);
  };

  const handleReset = () => {
    resetAllData();
    setImages([]);
    setTotalComparisons(0);
    setImagesImported(false);
    setResetDialogOpen(false);
    setNeedsImageFiles(false);
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
          
          // Calculate total comparisons from imported images
          const totalMatches = importedImages.reduce((sum, img) => sum + img.matches, 0);
          setTotalComparisons(totalMatches / 2);
          
          // Mark as imported if we have images with matches
          const hasMatches = importedImages.some(img => img.matches > 0);
          setImagesImported(hasMatches);
          
          toast.success("Data imported successfully");
          toast.info("Please select your image files now to match with the imported data", {
            duration: 8000,
          });
          setNeedsImageFiles(true);
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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const updatedImages = updateImagesWithFiles(images, Array.from(files));
      setImages(updatedImages);
      setNeedsImageFiles(false);
      toast.success(`Matched ${files.length} image files with imported data`);
    }
  };

  const handleSelectFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSelectFolder = () => {
    if (folderInputRef.current) {
      folderInputRef.current.click();
    }
  };

  useEffect(() => {
    // Update document title
    document.title = "Rank Everything App";
  }, []);

  return (
    <div className="min-h-screen bg-paper-cream">
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        imageCount={images.length}
      />
      
      <main className="container max-w-6xl mx-auto px-4 pb-16">
        {/* Tab content */}
        <div className="mt-12">
          {activeTab === "home" && (
            <div className="space-y-12">
              <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-center">
                {/* Export button - only show when images imported */}
                {imagesImported && (
                  <Button 
                    onClick={handleExport}
                    variant="outline" 
                    className="w-full md:w-auto magazine-body border-paper-brown/30 hover:bg-paper-beige text-ink-charcoal"
                    disabled={images.length === 0}
                  >
                    Export Progress
                  </Button>
                )}
                
                {/* Total comparisons counter - show in middle */}
                {totalComparisons > 0 && (
                  <div className="text-center magazine-body font-semibold text-xl text-ink-black">
                    {Math.round(totalComparisons)} comparison{totalComparisons !== 1 ? 's' : ''} completed
                  </div>
                )}
                
                <Button 
                  onClick={handleImportClick}
                  variant="outline" 
                  className="w-full md:w-auto magazine-body border-paper-brown/30 hover:bg-paper-beige text-ink-charcoal"
                  disabled={importLoading}
                >
                  {importLoading ? "Importing..." : "Import Progress"}
                </Button>
              </div>
              
              {/* Show file selection options after importing */}
              {needsImageFiles && (
                <Card className="p-8 flex flex-col items-center justify-center border-dashed border-2 border-paper-brown/30 bg-paper-beige/50">
                  <div className="text-center mb-6">
                    <h3 className="magazine-title text-xl text-ink-black mb-2">Select Image Files</h3>
                    <p className="magazine-body text-ink-gray">
                      Choose how you want to add images to match with your imported data
                    </p>
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    className="hidden"
                    multiple
                    accept="image/*"
                  />
                  
                  <input
                    type="file"
                    ref={folderInputRef}
                    onChange={handleFileInputChange}
                    className="hidden"
                    directory=""
                    webkitdirectory=""
                    multiple
                    accept="image/*"
                  />
                  
                  <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                    <Button 
                      onClick={handleSelectFiles}
                      className="flex-1 gap-2 magazine-body bg-teal hover:bg-teal-dark"
                      variant="outline"
                    >
                      <Upload size={18} />
                      Select Files
                    </Button>
                    
                    <Button 
                      onClick={handleSelectFolder}
                      className="flex-1 gap-2 magazine-body bg-teal hover:bg-teal-dark text-white"
                    >
                      <Folder size={18} />
                      Select Folder
                    </Button>
                  </div>
                </Card>
              )}
              
              {/* Only show uploader if there are no images or less than 2 */}
              {images.length < 2 && !needsImageFiles && (
                <ImageUploader onImagesAdded={handleImagesAdded} />
              )}
              
              {/* Only show comparison arena on home tab if we have enough images AND they have files */}
              {images.length >= 2 && (
                <ComparisonArena 
                  images={images} 
                  onRatingsUpdated={handleRatingsUpdated}
                  onReset={() => setResetDialogOpen(true)} 
                  needsImageFiles={needsImageFiles}
                  hasImagesWithFiles={hasImagesWithFiles}
                />
              )}
            </div>
          )}
          
          {activeTab === "rankings" && (
            <div className="space-y-8">
              <RankingsList images={images} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
