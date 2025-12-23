export interface Product {
    id: string;
    slug: string;
    name: { ar: string; en: string };
    vendor: { ar: string; en: string };
    price: number;
    originalPrice?: number;
    rating: number;
    reviewCount: number;
    description: { ar: string; en: string };
    images: string[];
    colors?: string[];
    sizes?: string[];
    category: string;
    isAvailable: boolean;
}

export const MOCK_PRODUCTS: Product[] = [
    {
        id: '1',
        slug: 'damascene-silk-scarf',
        name: {
            ar: 'شال حرير دمشقي مطرز يدوياً',
            en: 'Hand-Embroidered Damascene Silk Scarf',
        },
        vendor: {
            ar: 'خان الحرير',
            en: 'Khan Al-Harir',
        },
        price: 150000,
        originalPrice: 185000,
        rating: 4.8,
        reviewCount: 124,
        description: {
            ar: 'شال فاخر مصنوع من الحرير الطبيعي 100%، تم تطريزه يدوياً بأيدي أمهر الحرفيين في دمشق القديمة. يتميز بنقوش نباتية مستوحاة من التراث الأموي، ويأتي بألوان زاهية وثابتة. قطعة فنية تضفي لمسة من الأناقة والتاريخ على إطلالتك.',
            en: 'A luxurious scarf made of 100% natural silk, hand-embroidered by potential master craftsmen in Old Damascus. It features floral patterns inspired by Umayyad heritage and comes in bright, colorfast colors. An artistic piece that adds a touch of elegance and history to your look.',
        },
        images: [
            'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1601055283742-ce3a69a49c18?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=1000&auto=format&fit=crop',
        ],
        colors: ['#8B0000', '#F5F5DC', '#000080'], // Dark Red, Beige, Navy
        sizes: ['One Size'],
        category: 'fashion',
        isAvailable: true,
    },
    {
        id: '2',
        slug: 'aleppo-soap-gift-set',
        name: {
            ar: 'طقم هدايا صابون الغار الحلبي الملكي',
            en: 'Royal Aleppo Laurel Soap Gift Set',
        },
        vendor: {
            ar: 'صابون زنوبيا',
            en: 'Zenobia Soap',
        },
        price: 85000,
        rating: 5.0,
        reviewCount: 42,
        description: {
            ar: 'مجموعة فاخرة تحتوي على 3 قطع من صابون الغار الحلبي المعتق لمدة 5 سنوات، مصنوعة بزيت الزيتون العضوي وزيت الغار النقي. تأتي في صندوق خشبي محفور يدوياً، مما يجعلها هدية مثالية.',
            en: 'A luxurious set containing 3 pieces of Aleppo laurel soap aged for 5 years, made with organic olive oil and pure laurel oil. Comes in a hand-carved wooden box, making it the perfect gift.',
        },
        images: [
            'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1546552356-3fae876a61ca?q=80&w=1000&auto=format&fit=crop',
        ],
        category: 'beauty',
        isAvailable: true,
    },
    {
        id: '3',
        slug: 'mosaic-wooden-box',
        name: {
            ar: 'صندوق مجوهرات موزاييك خشبي',
            en: 'Mosaic Wooden Jewelry Box',
        },
        vendor: {
            ar: 'حرف دمشق',
            en: 'Damascus Crafts',
        },
        price: 320000,
        originalPrice: 400000,
        rating: 4.9,
        reviewCount: 89,
        description: {
            ar: 'صندوق مجوهرات رائع مشغول بفن الموزاييك الدمشقي الدقيق، يجمع بين خشب الجوز، الليمون، والورد، ومطعم بالصدف البحري الطبيعي. مبطن بالمخمل الأحمر الفاخر لحماية مجوهراتك.',
            en: 'An exquisite jewelry box crafted with intricate Damascene mosaic art, combining walnut, lemon, and rose wood, and inlaid with natural mother-of-pearl. Lined with luxurious red velvet to protect your jewelry.',
        },
        images: [
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1512161775974-9ef3f191599a?q=80&w=1000&auto=format&fit=crop'
        ],
        sizes: ['Small', 'Medium', 'Large'],
        category: 'home',
        isAvailable: true,
    }
];
