import { ImageItem, ComparisonResult } from "../types/image";

const STORAGE_KEY_IMAGES = "elo-arena-images";
const STORAGE_KEY_RESULTS = "elo-arena-results";
const DEFAULT_RATING = 1400;

// Optimize storage and retrieval with throttling/debouncing for large datasets
let saveDebounceTimeout: NodeJS.Timeout | null = null;

export const saveImagesToLocalStorage = (images: ImageItem[]): void => {
  // Clear any pending save operations
  if (saveDebounceTimeout) {
    clearTimeout(saveDebounceTimeout);
  }

  // Debounce save operations to reduce writes for large datasets
  saveDebounceTimeout = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY_IMAGES, JSON.stringify(images));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      // If localStorage is full, try to save a compressed version (without image data)
      const essentialData = images.map(img => ({
        id: img.id,
        name: img.name,
        filePath: img.filePath,
        rating: img.rating,
        matches: img.matches
      }));
      localStorage.setItem(STORAGE_KEY_IMAGES, JSON.stringify(essentialData));
    }
  }, 300);
};

export const getImagesFromLocalStorage = (): ImageItem[] => {
  const storedImages = localStorage.getItem(STORAGE_KEY_IMAGES);
  return storedImages ? JSON.parse(storedImages) : [];
};

// Optimize comparison result storage with batching
let pendingComparisonResults: ComparisonResult[] = [];
let saveResultsTimeout: NodeJS.Timeout | null = null;

export const saveComparisonResult = (result: ComparisonResult): void => {
  pendingComparisonResults.push(result);
  
  if (saveResultsTimeout) {
    clearTimeout(saveResultsTimeout);
  }
  
  saveResultsTimeout = setTimeout(() => {
    try {
      const storedResults = localStorage.getItem(STORAGE_KEY_RESULTS);
      const currentResults: ComparisonResult[] = storedResults 
        ? JSON.parse(storedResults) 
        : [];
      
      const updatedResults = [...currentResults, ...pendingComparisonResults];
      localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(updatedResults));
      
      // Clear the pending results
      pendingComparisonResults = [];
    } catch (error) {
      console.error("Error saving comparison results:", error);
    }
  }, 1000); // Batch write every 1 second
};

export const getComparisonResults = (): ComparisonResult[] => {
  const storedResults = localStorage.getItem(STORAGE_KEY_RESULTS);
  return storedResults ? JSON.parse(storedResults) : [];
};

export const addNewImages = (files: File[]): ImageItem[] => {
  const existingImages = getImagesFromLocalStorage();
  
  // Process files in batches for better performance with large sets
  const newImages: ImageItem[] = [];
  
  // Create a more efficient loop for large datasets
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    newImages.push({
      id: crypto.randomUUID(),
      name: file.name,
      url: URL.createObjectURL(file),
      filePath: file.name, // Store the file path for future reference
      rating: DEFAULT_RATING,
      matches: 0
    });
  }
  
  const allImages = [...existingImages, ...newImages];
  saveImagesToLocalStorage(allImages);
  
  return allImages;
};

export const resetAllData = (): void => {
  // Clear any pending operations
  if (saveDebounceTimeout) clearTimeout(saveDebounceTimeout);
  if (saveResultsTimeout) clearTimeout(saveResultsTimeout);
  
  localStorage.removeItem(STORAGE_KEY_IMAGES);
  localStorage.removeItem(STORAGE_KEY_RESULTS);
  pendingComparisonResults = [];
};

// Export data to a local file with file paths preserved
export const exportDataToFile = (): void => {
  // Get all data from localStorage
  const images = getImagesFromLocalStorage();
  const results = getComparisonResults();
  
  // Create a data object that contains both images and results
  const exportData = {
    images: images.map(image => ({
      ...image,
      // Store the file path but remove the temporary object URL
      // We'll keep the original URL field and just clean it for export
      url: null,
      filePath: image.filePath || image.name
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
  link.download = `rank-everything-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Import data from a local file with optimized loading
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
        
        // Process the imported images - more efficiently
        const importedImages: ImageItem[] = importedData.images.map((img: any) => {
          return {
            ...img,
            // Image URL will be handled by the file selection logic
            url: img.url || (img.filePath ? img.filePath : "#")
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

// Update the image type to include filePath with preloading optimization
export const updateImagesWithFiles = (images: ImageItem[], files: File[]): ImageItem[] => {
  // Create a map of filename -> File for quick lookups
  const fileMap = new Map<string, File>();
  files.forEach(file => {
    fileMap.set(file.name, file);
  });
  
  // Update images with matching files - batching for performance
  const updatedImages = images.map(image => {
    // Try to find a matching file by name or path
    const matchingFile = (image.filePath && fileMap.get(image.filePath)) || 
                         fileMap.get(image.name);
    
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
