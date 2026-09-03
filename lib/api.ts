const getApiUrl = () => {
  const base = process.env.NEXT_PUBLIC_API_URL || 'https://backend.valokichu.com';
  return base.endsWith('/api') ? base : `${base}/api`;
};

const API_URL = getApiUrl();


// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend.valokichu.com/api/v2';

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
  colors?: { id: number; name: string; image?: string | null; color_class?: string; priority?: number }[];
  bulk_discount_rules?: { min_qty: number; discount_amount: number }[];
  prev_slug?: string | null;
  next_slug?: string | null;
  prev_image?: string | null;
  next_image?: string | null;
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
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  } as Record<string, string>;

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  console.log(`${API_URL}${endpoint}`);
  const res = await fetch(`${API_URL}${endpoint}`, {
    cache: 'no-store',
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

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 4000): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
};

export const getCategoryList = async (): Promise<SingleResponse<Category[]>> => {
  // Try the nested list endpoint first (v1)
  try {
    const res = await fetchWithTimeout(`${API_URL}/v1/category-list`, {
      next: { revalidate: 60 },
    }, 3000);
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.data || []);
      return { status: true, data: list };
    }
  } catch (e) {
    // Silently proceed to fallback or return empty
  }

  // Fallback to simple categories
  try {
    const res = await fetchWithTimeout(`${API_URL}/categories`, {
      next: { revalidate: 60 },
    }, 3000);
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

  if (categorySlug) url += `&category_slug=${categorySlug}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (minPrice !== undefined) url += `&min_price=${minPrice}`;
  if (maxPrice !== undefined) url += `&max_price=${maxPrice}`;
  if (sort) url += `&sort_by=${sort}`;

  const defaultPaginated: PaginatedResponse<Product> = {
    status: false,
    data: {
      current_page: page,
      data: [],
      first_page_url: '',
      from: 0,
      last_page: 1,
      last_page_url: '',
      links: [],
      next_page_url: null,
      path: '',
      per_page: 10,
      prev_page_url: null,
      to: 0,
      total: 0,
    }
  };

  try {
    const res = await fetchWithTimeout(url, {
      cache: 'no-store'
    }, 4000);
    if (!res.ok) {
      return defaultPaginated;
    }
    return await res.json();
  } catch (e) {
    return defaultPaginated;
  }
};

export const getProduct = async (slug: string): Promise<SingleResponse<Product>> => {
  try {
    const res = await fetchWithTimeout(`${API_URL}/v2/products/${slug}`, {
      cache: 'no-store',
    }, 4000);
    if (!res.ok) {
      return { status: false, data: {} as Product, message: 'Product not found' };
    }
    return await res.json();
  } catch (e) {
    return { status: false, data: {} as Product, message: 'Product not found' };
  }
};

export const getCategory = async (slug: string): Promise<SingleResponse<Category & { meta_title?: string; meta_description?: string; meta_keywords?: string }>> => {
  try {
    const res = await fetchWithTimeout(`${API_URL}/categories/${slug}`, {
      next: { revalidate: 60 },
    }, 4000);
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
    const res = await fetchWithTimeout(`${API_URL}/banners`, {
      next: { revalidate: 60 },
    }, 4000);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.data || []);
  } catch (e) {
    return [];
  }
};

export const getCategorySections = async (): Promise<CategorySection[]> => {
  try {
    const res = await fetchWithTimeout(`${API_URL}/v1/categories-with-products`, {
      next: { revalidate: 60 },
    }, 4000);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.data || []);
  } catch (e) {
    return [];
  }
};

export const getNewArrivals = async (): Promise<Product[]> => {
  try {
    const res = await fetchWithTimeout(`${API_URL}/v1/items-sections?type=newarrival&limit=24`, {
      cache: 'no-store',
    }, 4000);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results?.products || data.products || [];
  } catch (e) {
    return [];
  }
};

export const getRecommendedProducts = async (): Promise<Product[]> => {
  try {
    const res = await fetchWithTimeout(`${API_URL}/v1/recommended-products`, {
      next: { revalidate: 60 },
    }, 4000);
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || data.data || [];
  } catch (e) {
    return [];
  }
};


export const getSettings = async (options: RequestInit = { next: { revalidate: 60 } }): Promise<Record<string, string>> => {
  try {
    const res = await fetchWithTimeout(`${API_URL}/settings`, options, 4000);

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
    const res = await fetchWithTimeout(`${API_URL}/v1/category-bars`, {
      next: { revalidate: 60 },
    }, 4000);
    if (!res.ok) return { status: false, data: [] };
    const data = await res.json();
    return { status: true, data: Array.isArray(data) ? data : (data.data || []) };
  } catch (e) {
    return { status: false, data: [] };
  }
};

export const getStoreInfo = async (username: string): Promise<SingleResponse<any>> => {
  try {
    const res = await fetchWithTimeout(`${API_URL}/v2/store/${username}`, {
      next: { revalidate: 60 }
    }, 4000);
    if (!res.ok) return { status: false, data: null };
    return res.json();
  } catch (e) {
    return { status: false, data: null };
  }
};
export const sendOrderInvoice = async (orderId: string, email: string) => {
  try {
    const res = await fetchWithTimeout(`${API_URL}/v1/orders/${orderId}/send-invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }, 5000);
    return await res.json();
  } catch (e) {
    return { status: false, message: 'Failed to connect to server' };
  }
};

export const getOrderSuccessDetails = async (orderId: string) => {
  try {
    const res = await fetchWithTimeout(`${API_URL}/v1/orders/${orderId}/success-details`, {}, 4000);
    if (!res.ok) return { status: false, message: 'Order not found' };
    return await res.json();
  } catch (e) {
    return { status: false, message: 'Failed to connect to server' };
  }
};

// Blog Types and API
export interface Blog {
  id: number;
  title: string;
  slug: string;
  category_id?: number;
  description?: string;
  thumbnail?: string;
  views: number;
  status: boolean;
  is_featured: boolean;
  meta_title?: string;
  meta_keywords?: string;
  meta_description?: string;
  meta_thumbnail?: string;
  created_at: string;
  updated_at: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
}

export const getBlogs = async (categorySlug?: string): Promise<Blog[]> => {
  try {
    let url = `${API_URL}/blogs`;
    if (categorySlug) url += `?category=${categorySlug}`;
    const res = await fetchWithTimeout(url, { next: { revalidate: 60 } }, 4000);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
};

export const getFeaturedBlogs = async (): Promise<Blog[]> => {
  try {
    const res = await fetchWithTimeout(`${API_URL}/blogs/featured`, { next: { revalidate: 60 } }, 4000);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
};

export const getBlogCategories = async (): Promise<BlogCategory[]> => {
  try {
    const res = await fetchWithTimeout(`${API_URL}/blogs/categories`, { next: { revalidate: 60 } }, 4000);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
};

export const getBlogBySlug = async (slug: string): Promise<Blog | null> => {
  try {
    const res = await fetchWithTimeout(`${API_URL}/blogs/${slug}`, { cache: 'no-store' }, 4000);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
};
