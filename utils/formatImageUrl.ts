
export const formatImageUrl = (imageUrl?: string, placeholder?: string): string => {
  const API_URL = process.env.NEXT_PUBLIC_API_FILE_URL;
  const CLOUDFRONT_URL = process.env.NEXT_PUBLIC_CLOUDFRONT_URL;
  if (!imageUrl) return formatImageUrl(placeholder || '/icons/image.png');

  try {
    // URLs complètes
    if (imageUrl.startsWith('http') || imageUrl.startsWith('https')) {
      return imageUrl;
    }

    // URLs avec uploads/ (cloudfront)
    if (imageUrl.startsWith('chicken-nation/') || imageUrl.includes('chicken-nation/')) {
      return `https://${CLOUDFRONT_URL}/${imageUrl}`;
    }

    // URLs avec uploads/ (format classique)
    if (imageUrl.startsWith('uploads/') || imageUrl.includes('uploads/')) {
      return `${API_URL}/${imageUrl}`;
    }

    if (imageUrl.startsWith('/')) {
      return imageUrl;
    }

    // Autres cas - ajouter / au début
    return '/' + imageUrl;
  } catch {
    return '';
  }
};
