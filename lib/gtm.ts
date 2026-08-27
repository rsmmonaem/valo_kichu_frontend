// Google Analytics 4 (GA4) / Google Tag Manager (GTM) dataLayer Event Utility

export interface GAItem {
    item_id: string | number;
    item_name: string;
    affiliation?: string;
    coupon?: string;
    currency?: string;
    discount?: number;
    index?: number;
    item_brand?: string;
    item_category?: string;
    item_category2?: string;
    item_category3?: string;
    item_category4?: string;
    item_category5?: string;
    item_list_id?: string;
    item_list_name?: string;
    item_variant?: string;
    location_id?: string;
    price?: number;
    quantity?: number;
}

export interface GAPromotion {
    promotion_id?: string;
    promotion_name?: string;
    creative_name?: string;
    creative_slot?: string;
    location_id?: string;
    items?: GAItem[];
}

export interface GAPurchaseParams {
    transaction_id: string | number;
    value: number;
    tax?: number;
    shipping?: number;
    currency?: string;
    coupon?: string;
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
    customer_address?: string;
    delivery_area?: string;
    items: GAItem[];
    [key: string]: any;
}

export interface GARefundParams {
    transaction_id: string | number;
    value?: number;
    currency?: string;
    items?: GAItem[];
}

// Push safe wrapper
export const pushToDataLayer = (data: Record<string, any>) => {
    if (typeof window !== 'undefined') {
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push(data);
    }
};

// Clear previous ecommerce object to prevent parameter leakage (recommended by Google)
export const clearEcommerce = () => {
    pushToDataLayer({ ecommerce: null });
};

// Helper: Convert a product object to standard GAItem
export const mapProductToGAItem = (
    product: any,
    index?: number,
    quantity: number = 1,
    variant?: any,
    listName?: string,
    listId?: string
): GAItem => {
    if (!product) {
        return {
            item_id: 'unknown',
            item_name: 'Unknown Product',
            price: 0,
            quantity: 1
        };
    }

    const basePrice = parseFloat(product.base_price || product.price || 0);
    const salePrice = product.sale_price ? parseFloat(product.sale_price) : null;
    const effectivePrice = salePrice && salePrice > 0 && salePrice < basePrice ? salePrice : basePrice;
    const discount = salePrice && salePrice > 0 && salePrice < basePrice ? parseFloat((basePrice - salePrice).toFixed(2)) : 0;

    let variantString = '';
    if (variant) {
        if (typeof variant === 'string') {
            variantString = variant;
        } else if (typeof variant === 'object') {
            const parts = [];
            if (variant.color) parts.push(`Color: ${typeof variant.color === 'string' ? variant.color : variant.color.name || ''}`);
            if (variant.size) parts.push(`Size: ${variant.size}`);
            if (variant.weight) parts.push(`Weight: ${typeof variant.weight === 'string' ? variant.weight : variant.weight.name || ''}`);
            variantString = parts.join(', ');
        }
    }

    return {
        item_id: String(product.id || product.item_id || ''),
        item_name: product.name || product.title || 'Product',
        affiliation: 'Valokichu Wholesale Marketplace',
        currency: 'BDT',
        discount: discount > 0 ? discount : undefined,
        index: index !== undefined ? index : undefined,
        item_brand: product.brand?.name || product.brand || 'Valokichu',
        item_category: product.category?.name || product.category || 'General',
        item_category2: product.subcategory?.name || product.subcategory || undefined,
        item_list_id: listId,
        item_list_name: listName,
        item_variant: variantString || undefined,
        price: effectivePrice || 0,
        quantity: quantity || 1
    };
};

// Helper: Convert a cart item to standard GAItem
export const mapCartItemToGAItem = (item: any, index?: number): GAItem => {
    return mapProductToGAItem(item, index, item.quantity || 1, item.variant);
};

// ==========================================
// ECOMMERCE EVENTS (GA4 Standard)
// ==========================================

// 1. view_item_list
export const trackViewItemList = (
    items: GAItem[],
    listId: string = 'product_list',
    listName: string = 'Product List'
) => {
    clearEcommerce();
    pushToDataLayer({
        event: 'view_item_list',
        ecommerce: {
            item_list_id: listId,
            item_list_name: listName,
            items: items.map((it, idx) => ({ ...it, index: it.index ?? idx + 1, item_list_id: listId, item_list_name: listName }))
        }
    });
};

// 2. select_item
export const trackSelectItem = (
    item: GAItem,
    listId: string = 'product_list',
    listName: string = 'Product List'
) => {
    clearEcommerce();
    pushToDataLayer({
        event: 'select_item',
        ecommerce: {
            item_list_id: listId,
            item_list_name: listName,
            items: [{ ...item, item_list_id: listId, item_list_name: listName }]
        }
    });
};

// 3. view_item
export const trackViewItem = (
    item: GAItem,
    value?: number,
    currency: string = 'BDT'
) => {
    clearEcommerce();
    const itemValue = value !== undefined ? value : Number(item.price || 0) * Number(item.quantity || 1);
    pushToDataLayer({
        event: 'view_item',
        ecommerce: {
            currency,
            value: itemValue,
            items: [item]
        }
    });
};

// 4. add_to_cart
export const trackAddToCart = (
    items: GAItem[],
    value?: number,
    currency: string = 'BDT'
) => {
    clearEcommerce();
    const totalValue = value !== undefined
        ? value
        : items.reduce((acc, it) => acc + (Number(it.price || 0) * Number(it.quantity || 1)), 0);

    pushToDataLayer({
        event: 'add_to_cart',
        ecommerce: {
            currency,
            value: totalValue,
            items
        }
    });
};

// 5. remove_from_cart
export const trackRemoveFromCart = (
    items: GAItem[],
    value?: number,
    currency: string = 'BDT'
) => {
    clearEcommerce();
    const totalValue = value !== undefined
        ? value
        : items.reduce((acc, it) => acc + (Number(it.price || 0) * Number(it.quantity || 1)), 0);

    pushToDataLayer({
        event: 'remove_from_cart',
        ecommerce: {
            currency,
            value: totalValue,
            items
        }
    });
};

// 6. view_cart
export const trackViewCart = (
    items: GAItem[],
    value?: number,
    currency: string = 'BDT'
) => {
    clearEcommerce();
    const totalValue = value !== undefined
        ? value
        : items.reduce((acc, it) => acc + (Number(it.price || 0) * Number(it.quantity || 1)), 0);

    pushToDataLayer({
        event: 'view_cart',
        ecommerce: {
            currency,
            value: totalValue,
            items
        }
    });
};

// 7. add_to_wishlist
export const trackAddToWishlist = (
    items: GAItem[],
    value?: number,
    currency: string = 'BDT'
) => {
    clearEcommerce();
    const totalValue = value !== undefined
        ? value
        : items.reduce((acc, it) => acc + (Number(it.price || 0) * Number(it.quantity || 1)), 0);

    pushToDataLayer({
        event: 'add_to_wishlist',
        ecommerce: {
            currency,
            value: totalValue,
            items
        }
    });
};

// 8. begin_checkout
export const trackBeginCheckout = (
    items: GAItem[],
    value?: number,
    currency: string = 'BDT',
    coupon?: string
) => {
    clearEcommerce();
    const totalValue = value !== undefined
        ? value
        : items.reduce((acc, it) => acc + (Number(it.price || 0) * Number(it.quantity || 1)), 0);

    pushToDataLayer({
        event: 'begin_checkout',
        ecommerce: {
            currency,
            value: totalValue,
            ...(coupon ? { coupon } : {}),
            items
        }
    });
};

// 9. add_shipping_info
export const trackAddShippingInfo = (
    items: GAItem[],
    value: number,
    shippingTier: string,
    currency: string = 'BDT'
) => {
    clearEcommerce();
    pushToDataLayer({
        event: 'add_shipping_info',
        ecommerce: {
            currency,
            value,
            shipping_tier: shippingTier,
            items
        }
    });
};

// 10. add_payment_info
export const trackAddPaymentInfo = (
    items: GAItem[],
    value: number,
    paymentType: string,
    currency: string = 'BDT'
) => {
    clearEcommerce();
    pushToDataLayer({
        event: 'add_payment_info',
        ecommerce: {
            currency,
            value,
            payment_type: paymentType,
            items
        }
    });
};

// 11. purchase
export const trackPurchase = (params: GAPurchaseParams) => {
    clearEcommerce();
    pushToDataLayer({
        event: 'purchase',
        customer_name: params.customer_name || undefined,
        customer_phone: params.customer_phone || undefined,
        customer_email: params.customer_email || undefined,
        customer_address: params.customer_address || undefined,
        delivery_area: params.delivery_area || undefined,
        ecommerce: {
            transaction_id: String(params.transaction_id),
            value: Number(params.value || 0),
            tax: params.tax !== undefined ? Number(params.tax) : 0,
            shipping: params.shipping !== undefined ? Number(params.shipping) : 0,
            currency: params.currency || 'BDT',
            delivery_area: params.delivery_area || undefined,
            customer_name: params.customer_name || undefined,
            customer_phone: params.customer_phone || undefined,
            customer_email: params.customer_email || undefined,
            customer_address: params.customer_address || undefined,
            ...(params.coupon ? { coupon: params.coupon } : {}),
            items: params.items
        }
    });
};

// 12. refund
export const trackRefund = (params: GARefundParams) => {
    clearEcommerce();
    pushToDataLayer({
        event: 'refund',
        ecommerce: {
            transaction_id: String(params.transaction_id),
            ...(params.value !== undefined ? { value: Number(params.value) } : {}),
            currency: params.currency || 'BDT',
            ...(params.items ? { items: params.items } : {})
        }
    });
};

// 13. view_promotion
export const trackViewPromotion = (promotions: GAPromotion[]) => {
    clearEcommerce();
    pushToDataLayer({
        event: 'view_promotion',
        ecommerce: {
            items: promotions
        }
    });
};

// 14. select_promotion
export const trackSelectPromotion = (promotion: GAPromotion) => {
    clearEcommerce();
    pushToDataLayer({
        event: 'select_promotion',
        ecommerce: {
            items: [promotion]
        }
    });
};

// ==========================================
// STANDARD / RECOMMENDED EVENTS
// ==========================================

// 15. login
export const trackLogin = (method: string = 'email') => {
    pushToDataLayer({
        event: 'login',
        method
    });
};

// 16. sign_up
export const trackSignUp = (method: string = 'email') => {
    pushToDataLayer({
        event: 'sign_up',
        method
    });
};

// 17. search
export const trackSearch = (searchTerm: string) => {
    pushToDataLayer({
        event: 'search',
        search_term: searchTerm
    });
};

// 18. generate_lead
export const trackGenerateLead = (
    leadType: string = 'General Inquiry',
    value?: number,
    currency: string = 'BDT'
) => {
    pushToDataLayer({
        event: 'generate_lead',
        lead_type: leadType,
        ...(value !== undefined ? { value, currency } : {})
    });
};

// 19. share
export const trackShare = (
    method: string,
    contentType: string,
    itemId: string
) => {
    pushToDataLayer({
        event: 'share',
        method,
        content_type: contentType,
        item_id: itemId
    });
};

// 20. select_content
export const trackSelectContent = (
    contentType: string,
    itemId: string
) => {
    pushToDataLayer({
        event: 'select_content',
        content_type: contentType,
        item_id: itemId
    });
};

// 21. earn_virtual_currency
export const trackEarnVirtualCurrency = (
    virtualCurrencyName: string,
    value: number
) => {
    pushToDataLayer({
        event: 'earn_virtual_currency',
        virtual_currency_name: virtualCurrencyName,
        value
    });
};

// 22. spend_virtual_currency
export const trackSpendVirtualCurrency = (
    itemName: string,
    virtualCurrencyName: string,
    value: number
) => {
    pushToDataLayer({
        event: 'spend_virtual_currency',
        item_name: itemName,
        virtual_currency_name: virtualCurrencyName,
        value
    });
};

// 23. tutorial_begin & tutorial_complete
export const trackTutorialBegin = () => {
    pushToDataLayer({
        event: 'tutorial_begin'
    });
};

export const trackTutorialComplete = () => {
    pushToDataLayer({
        event: 'tutorial_complete'
    });
};

// Generic Custom / Fallback Event
export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
    pushToDataLayer({
        event: eventName,
        ...params
    });
};
