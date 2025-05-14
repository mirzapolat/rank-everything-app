
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ImageItem } from "@/types/image";
import { addNewImages } from "@/utils/imageStorage";
import { Upload, Folder } from "lucide-react";

interface ImageUploaderProps {
  onImagesAdded: (images: ImageItem[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesAdded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (files: FileList | null) => {
    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      
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
      
      // Reset the inputs
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (folderInputRef.current) folderInputRef.current.value = "";
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilesSelected(e.target.files);
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilesSelected(e.target.files);
  };

  return (
    <Card className="p-6 flex flex-col items-center justify-center border-dashed border-2 bg-muted/50">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium">Upload Images</h3>
        <p className="text-sm text-muted-foreground">
          Choose how you want to add images to your project
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
      
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderChange}
        className="hidden"
        directory=""
        webkitdirectory=""
        multiple
        accept="image/*"
      />
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Button 
          onClick={handleSelectFiles}
          className="flex-1 gap-2"
          variant="outline"
        >
          <Upload size={18} />
          Select Files
        </Button>
        
        <Button 
          onClick={handleSelectFolder}
          className="flex-1 gap-2"
        >
          <Folder size={18} />
          Select Folder
        </Button>
      </div>
    </Card>
  );
};

export default ImageUploader;
