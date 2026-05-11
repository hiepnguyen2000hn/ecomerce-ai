// Generic envelope used by this API: { data: T }
export interface ApiDataResponse<T> {
  data: T;
}

// Auth
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserMe {
  id: string;
  email: string;
  name?: string;
  role: string;
}

// Products
export type LifecycleStage = 'DRAFT' | 'TESTING' | 'SCALING' | 'MATURE' | 'STOPPED';
export type ProductStatus = 'ACTIVE' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface VariantOption {
  id: string;
  groupId: string;
  name: string;
  skuSuffix: string | null;
  priceDelta: string;
  imageUrl: string | null;
  position: number;
}

export interface VariantGroup {
  id: string;
  productId: string;
  name: string;
  position: number;
  options: VariantOption[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  optionCombinationJson: Record<string, string>;
  priceAmount: string;
  currency: string;
  stockQty: number;
  position: number;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt: string;
  position: number;
  isPrimary: boolean;
  source: string;
  createdAt: string;
}

export interface ApiProduct {
  id: string;
  sku: string;
  name: string;
  slug?: string;
  description?: string;
  weightGrams?: number;
  cogsAmount?: string;
  cogsCurrency?: string;
  retailPriceAmount?: string;
  retailPriceCurrency?: string;
  marketCodes?: string[];
  lifecycleStage: LifecycleStage;
  status: ProductStatus;
  primaryImageUrl?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  variantGroups?: VariantGroup[];
  variants?: ProductVariant[];
  images?: ProductImage[];
}

export interface ProductsListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ProductsListResponse {
  data: ApiProduct[];
  meta: ProductsListMeta;
}

export interface CreateProductDto {
  sku: string;
  name: string;
  slug?: string;
  description?: string;
  weightGrams?: number;
  cogsAmount?: number;
  cogsCurrency?: string;
  retailPriceAmount?: number;
  retailPriceCurrency?: string;
  marketCodes?: string[];
}

export interface ProductsListParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  q?: string;
  lifecycleStage?: LifecycleStage[];
  status?: ProductStatus[];
  market?: string[];
  includeDeleted?: boolean;
}

export interface LifecycleTransitionDto {
  toStage: LifecycleStage;
  reason?: string;
}

export interface VariantOptionInputDto {
  name: string;
  skuSuffix?: string;
  priceDelta?: number;
  imageUrl?: string;
  position?: number;
}

export interface CreateVariantGroupDto {
  name: string;
  position?: number;
  options: VariantOptionInputDto[];
}

export interface UpdateVariantGroupDto {
  name?: string;
  position?: number;
}

export interface CreateVariantDto {
  sku: string;
  optionCombinationJson?: Record<string, string>;
  priceAmount: number;
  currency: string;
  stockQty?: number;
  position?: number;
}

export interface UpdateVariantDto {
  priceAmount?: number;
  currency?: string;
  stockQty?: number;
  optionCombinationJson?: Record<string, string>;
  position?: number;
}

// Users
export interface ApiUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}
