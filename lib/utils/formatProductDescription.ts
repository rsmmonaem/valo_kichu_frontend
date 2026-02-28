export const formatProductDescriptionUniversal = (text: string) => {
  if (!text) return "No description available.";

  // 1️⃣ Check if it already contains HTML
  const isHtml = /<\/?(?:p|ul|li|strong|b|br|div|span|h[1-6])[^>]*>/i.test(text);
  if (isHtml) return text;

  // 2️⃣ Decode minimal HTML entities (like &amp;, &nbsp;)
  let cleanText = text
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"');

  // 3️⃣ Fix completely unformatted text boundaries (missing spaces/newlines)
  cleanText = cleanText
    // Main Material:, Wash & Care:, Quality:, Zip flyPocket:, Gender:, ComfortableMeasurementSize:
    .replace(/([a-z])(Main Material:|Stretch:|Wash & Care:|Waist:|Quality:|Buttery smooth|Stylish and|Zip fly|Pocket:|Gender:|Measurement|Size:|Fabric:|Export Quality|Zippered|Soft & Comfortable|Measurements:|M=Waist|L=Waist|XL=Waist|XXL=Waist)/gi, "$1\n$2")
    .replace(/([a-zA-Z])(Size:|Fabric:|Measurements:|M=Waist|L=Waist|XL=Waist|XXL=Waist)/gi, "$1\n$2")
    .replace(/([0-9%])(Comfortable)/gi, "$1\n$2")
    .replace(/([a-zA-Z\u0980-\u09FF])(Men's Gabardine|Casual Men's)/gi, "$1\n$2")
    .replace(/([0-9])([a-zA-Z]*=Waist)/g, "$1\n$2")
    .replace(/([0-9])(Size:[0-9\s]+)/gi, "$1\n$2")
    .replace(/([a-z]{2,})\.([A-Z])/g, "$1.\n$2")
    .replace(/([a-z]+)""?([A-Z\u0980-\u09FF])/g, "$1\"\n\"$2")
    .replace(/""/g, '"\n"')
    // Handle HTML breaks if they exist as plain text
    .replace(/<br\s*\/?>/gi, "\n")
    // Convert various bullets to standard dash
    .replace(/•||▪|✅|⭐/g, "\n- ")
    // Remove carriage returns
    .replace(/\r/g, "");

  // Break sentences into newlines so they look better
  cleanText = cleanText.replace(/([a-z]{2,})\.\s+([A-Z])/g, "$1.\n$2");
  cleanText = cleanText.replace(/([a-zA-Z\u0980-\u09FF])(১\s?টি|২\s?টি|৩\s?টি|৪\s?টি)/g, "$1\n$2");
  cleanText = cleanText.replace(/([a-z0-9])(#)/gi, "$1\n$2");
  cleanText = cleanText.replace(/([!?.])([A-Z\u0980-\u09FF])/g, "$1\n$2");

  // 4️⃣ Split into lines and filter out empty ones
  const lines = cleanText.split(/\n+/).map(l => l.trim()).filter(Boolean);
  const formatted: string[] = [];

  let inList = false;

  lines.forEach((line) => {
    const isHeadingOrPair = /^[A-Za-z\u0980-\u09FF\s]+[:=]/.test(line);
    const isListItem = line.startsWith('-') || line.startsWith('*') || /^\d+[\.\)]/.test(line);

    // Start of list items, hash tags, or Bengali count formats
    if (isListItem || /\d+\s?টি/i.test(line) || line.startsWith('#')) {
      if (!inList) {
        formatted.push(`<ul class="list-disc ml-5 mb-4">`);
        inList = true;
      }
      const content = line.replace(/^[\-\*\s]+/, "");
      formatted.push(`<li>${content}</li>`);
    } else {
      if (inList) {
        formatted.push(`</ul>`);
        inList = false;
      }

      if (isHeadingOrPair && !line.includes('http')) {
        const separator = line.includes(':') ? ':' : '=';
        const parts = line.split(separator);
        if (parts.length >= 2 && parts[0].length < 40) {
          // Ensure Size strings and Waist lengths that map to measurements aren't blown out as gigantic headers
          formatted.push(`<p class="mb-2"><strong>${parts[0].trim()}${separator}</strong> ${parts.slice(1).join(separator).trim()}</p>`);
        } else {
          formatted.push(`<p class="mb-2"><strong>${line}</strong></p>`);
        }
      } else {
        formatted.push(`<p class="mb-2">${line}</p>`);
      }
    }
  });

  if (inList) {
    formatted.push(`</ul>`);
  }

  return formatted.join("\n").replace(/\n{3,}/g, "\n\n").trim();
};
