import { apiClient } from '../client';
import type {
  Product,
  ProductVariant,
  Category,
  PaginationParams,
  PaginatedResponse,
  ApiResponse,
} from '../types';

export interface ProductFilters extends PaginationParams {
  categoryId?: string;
  type?: 'book' | 'magazine' | 'subscription' | 'digital' | 'bundle';
  status?: 'draft' | 'published' | 'archived' | 'out_of_stock';
  featured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'createdAt' | 'popularity' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateProductData {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  type: ProductFilters['type'];
  categoryId: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku?: string;
  barcode?: string;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  images?: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
  variants?: Omit<ProductVariant, 'id' | 'productId'>[];
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  isFeatured?: boolean;
  isDigital?: boolean;
  digitalFileUrl?: string;
  inventoryQuantity?: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

export const productsApi = {
  // Products
  list: (params?: ProductFilters) =>
    apiClient.get<PaginatedResponse<Product>>('/products', { params }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Product>>(`/products/${id}`),

  getBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Product>>(`/products/slug/${slug}`),

  create: (data: CreateProductData) =>
    apiClient.post<ApiResponse<Product>>('/products', data),

  update: (data: UpdateProductData) =>
    apiClient.patch<ApiResponse<Product>>(`/products/${data.id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/products/${id}`),

  // Bulk operations
  bulkUpdate: (ids: string[], data: Partial<Product>) =>
    apiClient.patch<ApiResponse<Product[]>>('/products/bulk', { ids, data }),

  bulkDelete: (ids: string[]) =>
    apiClient.delete<ApiResponse<void>>('/products/bulk', { data: { ids } }),

  // Variants
  getVariants: (productId: string, params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<ProductVariant>>(`/products/${productId}/variants`, { params }),

  getVariant: (productId: string, variantId: string) =>
    apiClient.get<ApiResponse<ProductVariant>>(`/products/${productId}/variants/${variantId}`),

  createVariant: (productId: string, data: Omit<ProductVariant, 'id' | 'productId'>) =>
    apiClient.post<ApiResponse<ProductVariant>>(`/products/${productId}/variants`, data),

  updateVariant: (productId: string, variantId: string, data: Partial<ProductVariant>) =>
    apiClient.patch<ApiResponse<ProductVariant>>(`/products/${productId}/variants/${variantId}`, data),

  deleteVariant: (productId: string, variantId: string) =>
    apiClient.delete<ApiResponse<void>>(`/products/${productId}/variants/${variantId}`),

  // Images
  uploadImages: (productId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    return apiClient.post<ApiResponse<{ url: string; id: string }[]>>(`/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteImage: (productId: string, imageId: string) =>
    apiClient.delete<ApiResponse<void>>(`/products/${productId}/images/${imageId}`),

  reorderImages: (productId: string, imageIds: string[]) =>
    apiClient.patch<ApiResponse<void>>(`/products/${productId}/images/reorder`, { imageIds }),

  // Categories
  listCategories: (params?: PaginationParams & { parentId?: string; includeChildren?: boolean }) =>
    apiClient.get<PaginatedResponse<Category>>('/products/categories', { params }),

  getCategory: (id: string) =>
    apiClient.get<ApiResponse<Category>>(`/products/categories/${id}`),

  getCategoryBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Category>>(`/products/categories/slug/${slug}`),

  createCategory: (data: { name: string; slug: string; description?: string; parentId?: string; image?: string; isActive?: boolean }) =>
    apiClient.post<ApiResponse<Category>>('/products/categories', data),

  updateCategory: (id: string, data: Partial<Category>) =>
    apiClient.patch<ApiResponse<Category>>(`/products/categories/${id}`, data),

  deleteCategory: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/products/categories/${id}`),

  // Inventory
  adjustInventory: (productId: string, variantId: string | null, quantity: number, reason?: string) =>
    apiClient.post<ApiResponse<{ quantity: number }>>(`/products/${productId}/inventory/adjust`, { variantId, quantity, reason }),

  getInventoryHistory: (productId: string, params?: PaginationParams & { variantId?: string }) =>
    apiClient.get<PaginatedResponse<{ id: string; quantity: number; reason: string; date: string; user: string }>>(`/products/${productId}/inventory/history`, { params }),

  // Stats
  getStats: (params?: { dateFrom?: string; dateTo?: string }) =>
    apiClient.get<ApiResponse<{
      totalProducts: number;
      publishedProducts: number;
      lowStockProducts: number;
      outOfStockProducts: number;
      totalInventoryValue: number;
      productsByCategory: Record<string, number>;
      productsByType: Record<string, number>;
      topSellingProducts: Array<{ id: string; name: string; sold: number; revenue: number }>;
    }>>('/products/stats', { params }),

  // Export
  export: (params?: ProductFilters & { format?: 'csv' | 'xlsx' }) =>
    apiClient.get<Blob>('/products/export', { params, responseType: 'blob' }),

  // Import
  import: (file: File, options?: { updateExisting?: boolean; skipErrors?: boolean }) => {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.updateExisting) formData.append('updateExisting', 'true');
    if (options?.skipErrors) formData.append('skipErrors', 'true');
    return apiClient.post<ApiResponse<{ imported: number; updated: number; errors: number }>>('/products/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};