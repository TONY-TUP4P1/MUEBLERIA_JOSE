// src/utils/images.js

export const fixImageURL = (url) => {
    if (!url) return 'https://via.placeholder.com/300x300?text=Sin+Imagen';

    // 1. Si es de Google Drive
    if (url.includes('drive.google.com')) {
        // Extraer ID
        const idMatch = url.match(/\/d\/(.+?)(\/|$|\?)/);
        if (idMatch && idMatch[1]) {
            return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
        }
    }
    
    // 2. Si es de Google Photos (enlace largo lh3...) o Imgur, etc.
    return url;
};

export const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
    }).format(price);
};