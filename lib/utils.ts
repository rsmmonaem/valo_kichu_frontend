import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Safely parses API response attributes stored as JSON string
 */
export function parseAttributes(rawAttr: string | any[] | object | null | undefined): any[] {
    if (!rawAttr) return [];

    // If it's already an array, return as is
    if (Array.isArray(rawAttr)) return rawAttr;

    // If it's already an object (not string), wrap in array if needed
    if (typeof rawAttr === "object") return [rawAttr];

    try {
        // Clean extra quotes if needed
        let cleaned = String(rawAttr).replace(/^"+|"+$/g, "");

        // Replace escaped quotes if present
        cleaned = cleaned.replace(/\\"/g, '"').replace(/\\\\/g, "\\");

        const parsed = JSON.parse(cleaned);

        // Ensure it returns an array
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
        // console.error("Failed to parse attributes:", error, rawAttr);
        return [];
    }
}

/**
 * Safely parses a badly formatted gallery_images API response
 */
export function parseGalleryImages(rawArray: string | any[] | null | undefined): string[] {
    if (!rawArray) return [];

    try {
        // If it's already a string, wrap it into an array for uniform handling
        const arr = Array.isArray(rawArray) ? rawArray : [rawArray];

        // Join everything into a single string
        let joined = arr.join(',');

        // Remove leading/trailing quotes
        joined = joined.replace(/^"+|"+$/g, '');

        // Replace escaped quotes and backslashes
        joined = joined.replace(/\\"/g, '"').replace(/\\\\/g, '\\');

        // Parse JSON
        const parsed = JSON.parse(joined);

        // Ensure the result is an array
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        // console.error('Failed to parse gallery images:', error, rawArray);
        return [];
    }
}

/**
 * Returns a correct image URL by replacing backend localhost defaults with the actual API URL.
 */
export function getImageUrl(url: string | null | undefined): string {
    if (!url) return "";
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend.valokichu.com';
    const baseUrl = apiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');

    // If the URL already contains the current baseUrl, just return it
    if (url.startsWith(baseUrl)) {
        return url;
    }

    // If it's a relative path starting with /storage
    if (url.startsWith('/storage/')) {
        return `${baseUrl}${url}`;
    }

    // Replace hardcoded development URLs from backend database
    if (/http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(url)) {
        return url.replace(/http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, baseUrl);
    }

    // Replace production URL with current baseUrl (useful for local testing with prod db)
    if (url.includes('https://backend.valokichu.com')) {
         return url.replace('https://backend.valokichu.com', baseUrl);
    }

    // If it's a relative path that doesn't start with http or /
    if (!url.startsWith('http') && !url.startsWith('/')) {
        // Many database paths omit the 'storage/' prefix. If it doesn't have it, add it.
        const cleanPath = url.replace(/^(storage\/)/, '');
        return `${baseUrl}/storage/${cleanPath}`;
    }

    return url;
}
