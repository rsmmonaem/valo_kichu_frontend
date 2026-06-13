const getApiUrl = () => {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return base.endsWith('/api') ? base : `${base}/api`;
};

const API_URL = getApiUrl();


// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v2';

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description?: string | null;
  specifications?: string | null; // JSON string or HTML from API
  base_price: string;
  price?: string; // fallback
  sale_price: string;
  stock_quantity: number;
  image: string;
  thumbnail?: string;
  images?: string | string[] | { image: string }[];
  category: {
    name: string;
    slug: string;
  };
  brand: {
    name: string;
    slug: string;
  };
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  meta_image?: string;
  rating?: number;
  sold_count?: number;
  attributes?: any; // JSON string or list from API
  gallery_images?: any; // JSON string or list from API
  tags?: string[] | string; // array or comma-sep string
  video_link?: string;
  key_features?: string[];
  rating_count?: number;
  loyalty_points?: number;
  current_stock?: number; // admin products page uses this
  status?: string; // admin products page uses this
  product_code?: string;
  image_url?: string;
  gallery_image_urls?: string[];
  colors?: { id: number; name: string; image?: string | null; color_class?: string }[];
  variations?: {
    id: number;
    color?: string;
    sku?: string;
    stock?: number;
    price?: number;
    color_image?: string;
    attributes?: Record<string, string>; // e.g. { Size: "M", Weight: "1kg" }
  }[];
}

export const authFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  } as Record<string, string>;

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  console.log(`${API_URL}${endpoint}`);
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return res;
};

export interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
  image_url?: string;
  icon?: string;
  show_in_bar?: boolean;
  bar_icon?: string;
  custom_icon?: string;
  custom_icon_url?: string;
  subcategories?: Category[];
}

export interface PaginatedResponse<T> {
  status: boolean;
  data: {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export interface SingleResponse<T> {
  status: boolean;
  data: T;
  message?: string;
}

export const getCategoryList = async (): Promise<SingleResponse<Category[]>> => {
  // Try the nested list endpoint first (v1)
  try {
    const res = await fetch(`${API_URL}/v1/category-list`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.data || []);
      return { status: true, data: list };
    }
  } catch (e) {
    console.error("Failed to fetch category-list", e);
  }

  // Fallback to simple categories
  try {
    const res = await fetch(`${API_URL}/categories`, {
      cache: 'no-store',
    });
    if (!res.ok) return { status: false, data: [] };
    const data = await res.json();

    // Handle both array and paginated response
    const list = Array.isArray(data) ? data : (data.data?.data || data.data || []);
    return { status: true, data: list };
  } catch (e) {
    return { status: false, data: [] };
  }
}

export const getProducts = async (
  page = 1,
  categorySlug?: string,
  search?: string,
  minPrice?: number,
  maxPrice?: number,
  sort?: string
): Promise<PaginatedResponse<Product>> => {
  let url = `${API_URL}/v2/products?page=${page}`;

  // NOTE: Backend controller mainly filters by 'category_id'. 
  // 'category_slug' support depends on implementation, but standard Laravel uses ID.
  // We assume 'category_slug' param is translated or handled by backend if passed as filter.
  // If backend expects ID, we'd need to fetch category first. 
  // For now, let's pass both 'category' and 'category_slug' if possible if logic supports strict slug.
  // Actually, let's pass `category_slug` as `category` parameter if backend supports slug resolution on 'category' field.
  // If not, we rely on ID.
  // Assuming backend handles logic.
  if (categorySlug) url += `&category_slug=${categorySlug}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (minPrice !== undefined) url += `&min_price=${minPrice}`;
  if (maxPrice !== undefined) url += `&max_price=${maxPrice}`;
  if (sort) url += `&sort_by=${sort}`; // Backend check: $sorting = $request->get('sorting') ?? $request->get('sort_by');

  const res = await fetch(url, {
    cache: 'no-store'
  });
  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }
  return res.json();
};

export const getProduct = async (slug: string): Promise<SingleResponse<Product>> => {
  const res = await fetch(`${API_URL}/v2/products/${slug}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    return { status: false, data: {} as Product, message: 'Product not found' };
  }
  return res.json();
};



export const getCategory = async (slug: string): Promise<SingleResponse<Category & { meta_title?: string; meta_description?: string; meta_keywords?: string }>> => {
  try {
    const res = await fetch(`${API_URL}/categories/${slug}`, {
      cache: 'no-store',
    });
    if (!res.ok) return { status: false, data: {} as any, message: 'Category not found' };
    const data = await res.json();
    return { status: true, data };
  } catch (e) {
    return { status: false, data: {} as any };
  }
};

export interface Banner {
  id: number;
  title?: string;
  image: string;
  image_url?: string;
  link?: string;
}

export interface CategorySection {
  category: Category;
  products: Product[];
}

export const getBanners = async (): Promise<Banner[]> => {
  try {
    const res = await fetch(`${API_URL}/banners`, {
      cache: 'no-store',
    }); // exists at root /api/banners
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.data || []);
  } catch (e) {
    return [];
  }
};

export const getCategorySections = async (): Promise<CategorySection[]> => {
  try {
    const res = await fetch(`${API_URL}/v1/categories-with-products`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.data || []);
  } catch (e) {
    return [];
  }
};

export const getNewArrivals = async (): Promise<Product[]> => {
  try {
    const res = await fetch(`${API_URL}/v1/items-sections?type=newarrival&limit=12`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    // API returns { results: { products: [] } } or similar based on home.jsx analysis
    return data.results?.products || data.products || [];
  } catch (e) {
    return [];
  }
};

export const getRecommendedProducts = async (): Promise<Product[]> => {
  try {
    const res = await fetch(`${API_URL}/v1/recommended-products`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || data.data || [];
  } catch (e) {
    return [];
  }
};


export const getSettings = async (options: RequestInit = { cache: 'no-store' }): Promise<Record<string, string>> => {
  try {
    const res = await fetch(`${API_URL}/settings`, options);

    if (!res.ok) return {};
    const data = await res.json();
    const settingsMap: Record<string, string> = {};
    if (Array.isArray(data)) {
      data.forEach((s: any) => settingsMap[s.key] = s.value);
    }
    return settingsMap;
  } catch (e) {
    return {};
  }
};

export const getCategoryBar = async (): Promise<SingleResponse<Category[]>> => {
  try {

    const res = await fetch(`${API_URL}/v1/category-bars`, {
      cache: 'no-store',
    });
    if (!res.ok) return { status: false, data: [] };
    const data = await res.json();
    return { status: true, data: Array.isArray(data) ? data : (data.data || []) };
  } catch (e) {
    return { status: false, data: [] };
  }
};

export const getStoreInfo = async (username: string): Promise<SingleResponse<any>> => {
  try {
    const res = await fetch(`${API_URL}/v2/store/${username}`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return { status: false, data: null };
    return res.json();
  } catch (e) {
    return { status: false, data: null };
  }
};
export const sendOrderInvoice = async (orderId: string, email: string) => {
  try {
    const res = await fetch(`${API_URL}/v1/orders/${orderId}/send-invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return await res.json();
  } catch (e) {
    return { status: false, message: 'Failed to connect to server' };
  }
};
