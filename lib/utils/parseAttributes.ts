export interface ProductAttribute {
    name: string;
    values: any[];
  }
  
  export const parseAttributes = (attributes: any): ProductAttribute[] => {
    if (!attributes) return [];
    
    if (Array.isArray(attributes)) {
      return attributes;
    }
    
    if (typeof attributes === 'string') {
      try {
        return JSON.parse(attributes);
      } catch {
        return [];
      }
    }
    
    if (typeof attributes === 'object') {
      return Object.entries(attributes).map(([key, value]) => ({
        name: key,
        values: Array.isArray(value) ? value : [value]
      }));
    }
    
    return [];
  };