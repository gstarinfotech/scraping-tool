const shippingRates = {
    'Shoes': 14, 'Shoe': 14, 'Sandal': 13, 'Sandals': 13, 'Booties': 16, 'Boot': 16, 'Boots': 16, 'Clog': 14, 'Clogs': 14,
    'Slippers': 13, 'Slipper': 13, 'Loafer': 14, 'Loafers': 14, 'Sneaker': 14, 'Sneakers': 14, 'T-Shirt': 11.5, 'T-Shirts': 11.5,
    'Jeans': 13, 'Jean': 13, 'Shorts': 11.5, 'Short': 11.5, 'Shirts': 11.5, 'Shirt': 11.5, 'Pants': 11.5, 'Pant': 11.5,
    'Hoodie': 15, 'Pullover': 15, 'Sweatshirt': 13, 'Sweatshirts': 13, 'Jacket': 15, 'Jackets': 15, 'Blazer': 21,
    'Blazers': 21, 'Kurta': 11.5, 'Legging': 11.5, 'Kurti': 11.5, 'Bra': 10.5, 'Panty': 10.5, 'Panties': 10.5, 'Underwear': 10.5, 'Brief': 10.5, 'Briefs': 10.5,
    'Hipster': 10.5, 'Cardigan': 11.5, 'Neck Top': 11.5, 'Tank Top': 11.5, 'Skirt': 11.5, 'Open Front': 11.5, 'Peasant Top': 11.5,
    'Scoop Neck': 11.5, 'Flat': 13
};

export const calculateShippingCost = (title) => {
    if (!title) return 0;

    const normalizedTitle = title.trim().toLowerCase();
    for (const [key, price] of Object.entries(shippingRates)) {
        if (normalizedTitle.includes(key.toLowerCase())) {
            return price;
        }
    }
    return 0;
};