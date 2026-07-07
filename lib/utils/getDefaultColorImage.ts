/**
 * Given a parsed colors array (from product.colors),
 * returns the color with the lowest priority value (priority 1 = highest).
 * Falls back to the first color if no priority is set.
 */
export function getDefaultColor(parsedColors: any[]): any | null {
  if (!parsedColors || parsedColors.length === 0) return null;

  // Filter colors that have a numeric priority set
  const withPriority = parsedColors.filter(
    (c) => c.priority !== null && c.priority !== undefined && !isNaN(Number(c.priority))
  );

  if (withPriority.length > 0) {
    // Sort ascending by priority — lowest number wins
    const sorted = [...withPriority].sort((a, b) => Number(a.priority) - Number(b.priority));
    return sorted[0];
  }

  // No priority set → use first color
  return parsedColors[0];
}

/**
 * Resolves a raw image URL to an absolute URL using the API base URL.
 */
export function resolveColorImageUrl(
  url: string | null | undefined,
  baseUrl: string
): string {
  if (!url) return '';
  let cleanUrl = url;
  if (!url.startsWith('http')) {
    cleanUrl = `${baseUrl}/storage/products/${url.replace(/^\/?((storage\/products|products)\/)?/, '')}`;
  }
  if (cleanUrl.includes('localhost:8000') || cleanUrl.includes('127.0.0.1')) {
    const filename = cleanUrl.split('/').pop() || '';
    if (filename.startsWith('ss')) {
      return cleanUrl.replace(/^https?:\/\/[^/]+/, 'https://backend.valokichu.com');
    }
  }
  return cleanUrl;
}
