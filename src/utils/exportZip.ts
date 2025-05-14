
import JSZip from "jszip";
import { ImageItem } from "../types/image";

export type ExportFormat = "elo" | "rank";

export const exportRankingsAsZip = async (
  images: ImageItem[],
  format: ExportFormat
): Promise<void> => {
  // Create a new JSZip instance
  const zip = new JSZip();
  
  // Sort images by rating (ELO) in descending order
  const sortedImages = [...images].sort((a, b) => b.rating - a.rating);
  
  // Process each image and add it to the zip file
  const fetchPromises = sortedImages.map(async (image, index) => {
    try {
      // Determine the prefix based on selected format
      let prefix: string;
      
      if (format === "elo") {
        // Use ELO rating as prefix (rounded to integer)
        prefix = `${Math.round(image.rating)}_`;
      } else {
        // Use rank number as prefix (1-based)
        prefix = `${index + 1}_`;
      }
      
      // Get original filename without path
      const originalName = image.name;
      
      // Create the new filename with prefix
      const newFilename = `${prefix}${originalName}`;
      
      // Fetch the image data
      const response = await fetch(image.url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${image.url}`);
      }
      
      // Get the blob data from the fetch response
      const blob = await response.blob();
      
      // Add the blob to the zip file with the prefixed name
      zip.file(newFilename, blob);
      
      return true;
    } catch (error) {
      console.error("Error processing image for zip:", error);
      return false;
    }
  });
  
  // Wait for all fetch operations to complete
  await Promise.all(fetchPromises);
  
  // Generate the zip file
  const zipBlob = await zip.generateAsync({ type: "blob" });
  
  // Create a download link for the zip file
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(zipBlob);
  downloadLink.download = `rankings_${format}_${new Date().toISOString().split('T')[0]}.zip`;
  
  // Trigger the download
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  
  // Clean up the object URL
  URL.revokeObjectURL(downloadLink.href);
};
