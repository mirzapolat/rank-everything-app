
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ImageItem } from "@/types/image";
import { addNewImages } from "@/utils/imageStorage";

interface ImageUploaderProps {
  onImagesAdded: (images: ImageItem[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesAdded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      
      // Check if files are images
      const invalidFiles = filesArray.filter(
        file => !file.type.startsWith("image/")
      );
      
      if (invalidFiles.length > 0) {
        toast.error("Some files are not images. Only image files are allowed.");
        return;
      }
      
      const updatedImages = addNewImages(filesArray);
      onImagesAdded(updatedImages);
      
      toast.success(`Added ${filesArray.length} images successfully!`);
      
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Card className="p-6 flex flex-col items-center justify-center border-dashed border-2 bg-muted/50">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium">Upload Images</h3>
        <p className="text-sm text-muted-foreground">
          Click to select multiple images from your device
        </p>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept="image/*"
      />
      
      <Button 
        onClick={handleButtonClick}
        className="bg-teal hover:bg-teal-dark transition-colors"
      >
        Select Images
      </Button>
    </Card>
  );
};

export default ImageUploader;
