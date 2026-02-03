export const parseGalleryImages = (galleryImages: any): string[] => {
    if (!galleryImages) return [];
    
    if (Array.isArray(galleryImages)) {
      return galleryImages;
    }
    
    if (typeof galleryImages === 'string') {
      try {
        return JSON.parse(galleryImages);
      } catch {
        return galleryImages.split(',').map((img: string) => img.trim());
      }
    }
    
    return [];
  };