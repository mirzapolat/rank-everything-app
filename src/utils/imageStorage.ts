
import { ImageItem, ComparisonResult } from "../types/image";

const STORAGE_KEY_IMAGES = "elo-arena-images";
const STORAGE_KEY_RESULTS = "elo-arena-results";
const DEFAULT_RATING = 1400;

export const saveImagesToLocalStorage = (images: ImageItem[]): void => {
  localStorage.setItem(STORAGE_KEY_IMAGES, JSON.stringify(images));
};

export const getImagesFromLocalStorage = (): ImageItem[] => {
  const storedImages = localStorage.getItem(STORAGE_KEY_IMAGES);
  return storedImages ? JSON.parse(storedImages) : [];
};

export const saveComparisonResult = (result: ComparisonResult): void => {
  const storedResults = localStorage.getItem(STORAGE_KEY_RESULTS);
  const results: ComparisonResult[] = storedResults 
    ? JSON.parse(storedResults) 
    : [];
  
  results.push(result);
  localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(results));
};

export const getComparisonResults = (): ComparisonResult[] => {
  const storedResults = localStorage.getItem(STORAGE_KEY_RESULTS);
  return storedResults ? JSON.parse(storedResults) : [];
};

export const addNewImages = (files: File[]): ImageItem[] => {
  const existingImages = getImagesFromLocalStorage();
  
  const newImages: ImageItem[] = files.map(file => ({
    id: crypto.randomUUID(),
    name: file.name,
    url: URL.createObjectURL(file),
    filePath: file.name, // Store the file name for future reference
    rating: DEFAULT_RATING,
    matches: 0
  }));
  
  const allImages = [...existingImages, ...newImages];
  saveImagesToLocalStorage(allImages);
  
  return allImages;
};

export const resetAllData = (): void => {
  localStorage.removeItem(STORAGE_KEY_IMAGES);
  localStorage.removeItem(STORAGE_KEY_RESULTS);
};

// Export data to a local file
export const exportDataToFile = (): void => {
  // Get all data from localStorage
  const images = getImagesFromLocalStorage();
  const results = getComparisonResults();
  
  // Create a data object that contains both images and results
  const exportData = {
    images: images.map(image => ({
      ...image,
      // Store the file path but remove the temporary object URL
      url: null
    })),
    results
  };
  
  // Convert to JSON string
  const jsonString = JSON.stringify(exportData, null, 2);
  
  // Create a blob with the data
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  // Create a download link and trigger the download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `elo-arena-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Import data from a local file
export const importDataFromFile = async (file: File): Promise<ImageItem[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        // Parse the JSON data from the file
        const importedData = JSON.parse(event.target?.result as string);
        
        // Validate basic structure
        if (!importedData.images || !Array.isArray(importedData.images)) {
          throw new Error("Invalid backup file format");
        }
        
        // Process the imported images
        // We'll use the filePath stored in the export to try to match with uploaded files
        const importedImages: ImageItem[] = importedData.images.map((img: any) => {
          return {
            ...img,
            // Add a placeholder URL that will be replaced when matching files are uploaded
            url: img.url || "#"
          };
        });
        
        // Save imported data to localStorage
        saveImagesToLocalStorage(importedImages);
        
        // Save comparison results if they exist
        if (importedData.results && Array.isArray(importedData.results)) {
          localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(importedData.results));
        }
        
        resolve(importedImages);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read the file"));
    };
    
    reader.readAsText(file);
  });
};

// Update the image type to include filePath
export const updateImagesWithFiles = (images: ImageItem[], files: File[]): ImageItem[] => {
  // Create a map of filename -> File for quick lookups
  const fileMap = new Map<string, File>();
  files.forEach(file => {
    fileMap.set(file.name, file);
  });
  
  // Update images with matching files
  const updatedImages = images.map(image => {
    // Try to find a matching file by name
    const matchingFile = image.filePath && fileMap.get(image.filePath);
    
    if (matchingFile) {
      // If we found a match, update the URL
      return {
        ...image,
        url: URL.createObjectURL(matchingFile)
      };
    }
    
    // No match found, return the image as-is
    return image;
  });
  
  // Save the updated images
  saveImagesToLocalStorage(updatedImages);
  
  return updatedImages;
};
