"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatProductDescriptionUniversal = void 0;
var formatProductDescriptionUniversal = function (text) {
    if (!text)
        return "No description available.";
    // 1️⃣ Check if it already contains HTML
    var isHtml = /<\/?(?:p|ul|li|strong|b|br|div|span|h[1-6])[^>]*>/i.test(text);
    if (isHtml)
        return text;
    // 2️⃣ Decode minimal HTML entities (like &amp;, &nbsp;)
    var cleanText = text
        .replace(/&amp;/g, "&")
        .replace(/&nbsp;/g, " ")
        .replace(/&quot;/g, '"');
    // 3️⃣ Fix completely unformatted text boundaries (missing spaces/newlines)
    cleanText = cleanText
        // Fix missing spaces/newlines before keywords
        .replace(/([a-zA-Z0-9])(Product Dimensions:|Item Weight:|Input\s*:|Output\s*:|Compatible Batteries:|Features:|Specifications:|Brand:|Color:|Material:|Size:|Measurements:)/gi, "$1\n$2")
        // Fix missing spaces around Sizes/Waist lists
        .replace(/([0-9])([a-zA-Z]=Waist)/g, "$1\n$2")
        .replace(/([0-9])(Size:)/gi, "$1\n$2")
        // Fix missing space/newline after a period or quote followed by a capital letter/quote
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
    cleanText = cleanText.replace(/([a-z0-9])(#)/gi, "$1\n$2");
    // 4️⃣ Split into lines and filter out empty ones
    var lines = cleanText.split(/\n+/).map(function (l) { return l.trim(); }).filter(Boolean);
    var formatted = [];
    var inList = false;
    lines.forEach(function (line) {
        var isHeadingOrPair = /^[A-Za-z\u0980-\u09FF\s]+[:=]/.test(line);
        var isListItem = line.startsWith('-') || line.startsWith('*') || /^\d+[\.\)]/.test(line);
        // Start of list items, hash tags, or Bengali count formats
        if (isListItem || /\d+\s?টি/i.test(line) || line.startsWith('#')) {
            if (!inList) {
                formatted.push("<ul class=\"list-disc ml-5 mb-4\">");
                inList = true;
            }
            var content = line.replace(/^[\-\*\s]+/, "");
            formatted.push("<li>".concat(content, "</li>"));
        }
        else {
            if (inList) {
                formatted.push("</ul>");
                inList = false;
            }
            if (isHeadingOrPair && !line.includes('http')) {
                var separator = line.includes(':') ? ':' : '=';
                var parts = line.split(separator);
                if (parts.length >= 2 && parts[0].length < 40) {
                    // Ensure Size strings and Waist lengths that map to measurements aren't blown out as gigantic headers
                    formatted.push("<p class=\"mb-2\"><strong>".concat(parts[0].trim()).concat(separator, "</strong> ").concat(parts.slice(1).join(separator).trim(), "</p>"));
                }
                else {
                    formatted.push("<p class=\"mb-2\"><strong>".concat(line, "</strong></p>"));
                }
            }
            else {
                formatted.push("<p class=\"mb-2\">".concat(line, "</p>"));
            }
        }
    });
    if (inList) {
        formatted.push("</ul>");
    }
    return formatted.join("\n").replace(/\n{3,}/g, "\n\n").trim();
};
exports.formatProductDescriptionUniversal = formatProductDescriptionUniversal;
