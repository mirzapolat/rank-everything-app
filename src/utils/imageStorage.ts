
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
