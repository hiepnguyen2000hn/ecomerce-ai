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

export interface ApiProduct {
  id: string;
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
  lifecycleStage: LifecycleStage;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
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
