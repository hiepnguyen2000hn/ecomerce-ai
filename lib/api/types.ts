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
  role?: string;
  roles?: string[];
}

// Products
export type LifecycleStage = 'DRAFT' | 'TESTING' | 'SCALING' | 'MATURE' | 'STOPPED';
export type ProductStatus = 'ACTIVE' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface VariantInGroup {
  id: string;
  optionId: string;
  name: string;
  sku: string;
  priceAmount: string;
  currency: string;
  stockQty: number;
  imageUrl: string | null;
  position: number;
}

export interface VariantGroup {
  id: string;
  name: string;
  position: number;
  variants: VariantInGroup[];
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
  updatedAt?: string;
  deletedAt?: string | null;
  variantSummary?: string[];
  variantGroups?: VariantGroup[];
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
  /** URLs returned by POST /file-storage/upload. First URL becomes primary image. */
  imageUrls?: string[];
}

export interface UpdateProductVariantDto {
  id?: string;
  name?: string;
  sku?: string;
  priceAmount?: number;
  currency?: string;
  stockQty?: number;
  imageUrl?: string | null;
  position?: number;
}

export interface UpdateProductVariantGroupDto {
  id?: string;
  name?: string;
  position?: number;
  variants?: UpdateProductVariantDto[];
}

export interface UpdateProductDto {
  sku?: string;
  name?: string;
  slug?: string;
  description?: string;
  weightGrams?: number;
  cogsAmount?: number;
  cogsCurrency?: string;
  retailPriceAmount?: number;
  retailPriceCurrency?: string;
  marketCodes?: string[];
  variantGroups?: UpdateProductVariantGroupDto[];
  /** URLs returned by POST /file-storage/upload. First URL becomes primary image. */
  imageUrls?: string[];
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
  name?: string;
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

export function userDisplayRole(user: UserMe): string {
  if (user.roles && user.roles.length > 0) return user.roles[0];
  if (user.role) return user.role;
  return 'User';
}

// Users (full view from backend)
export interface ApiUserFull {
  id: string;
  email: string;
  fullName: string;
  status: string;
  roles: string[];
  createdAt: string;
}

// LP Templates
export interface LpTemplate {
  id: string;
  code: string;
  name: string;
  masterHtmlPath: string;
  screenshotUrl?: string;
  lang: string;
  marketCode: string;
  active: boolean;
  perfScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLpTemplateDto {
  code: string;
  name: string;
  masterHtmlPath: string;
  screenshotUrl?: string;
  lang: string;
  marketCode: string;
  active?: boolean;
}

export type UpdateLpTemplateDto = Partial<CreateLpTemplateDto>;

// Landing Pages
export type LandingPageStatus = 'DRAFT' | 'NEEDS_REVIEW' | 'PUBLISHED' | 'ARCHIVED';

export interface ApiLandingPage {
  id: string;
  productId: string;
  templateId?: string;
  code: string;
  marketCode: string;
  lang: string;
  slug: string;
  status: LandingPageStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLandingPageDto {
  productId: string;
  templateId?: string;
  code: string;
  marketCode: string;
  lang: string;
  slug: string;
}

export type UpdateLandingPageDto = Partial<CreateLandingPageDto>;

export interface StatusTransitionDto {
  toStatus: LandingPageStatus;
  reason?: string;
}

// Lp Batch
export type LpBatchStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface ApiLpBatch {
  id: string;
  productId: string;
  count: number;
  lang: string;
  contentSource: 'AI_AUTO' | 'GOOGLE_DRIVE';
  templateStrategy: 'AI_OPTIMIZE' | 'MANUAL';
  templateIds?: string[];
  driveFileIds?: string[];
  status: LpBatchStatus;
  generatedLpIds?: string[];
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLpBatchResponse {
  status: number;
  data: {
    batchJobId: string;
    status: LpBatchStatus;
  };
}

export interface CreateLpBatchDto {
  productId: string;
  count: number;
  lang: string;
  contentSource: 'AI_AUTO' | 'GOOGLE_DRIVE';
  templateStrategy: 'AI_OPTIMIZE' | 'MANUAL';
  templateIds?: string[];
  driveFileIds?: string[];
  driveAuthCode?: string;
}

// Lp Batch — Landing Pages (portfolio + detail)
export type LpBatchLpStatus = 'DRAFT' | 'NEEDS_REVIEW' | 'PUBLISHED' | 'ARCHIVED';

export interface ApiLpBatchLandingPage {
  id: string;
  productId?: string;
  batchId?: string;
  templateId?: string;
  code: string;
  marketCode?: string;
  lang?: string;
  slug?: string;
  status: LpBatchLpStatus;
  htmlUrl?: string;
  publicUrl?: string;
  thumbnailUrl?: string | null;
  analytics?: {
    impressions?: number;   // → TRAFFIC: Total views
    clicks?: number;        // → TRAFFIC: Users
    conversions?: number;   // → ORDER count
    cvr?: number;           // → CVR (decimal, x100 để hiện %)
    revenue?: number;       // → CPA = revenue / conversions
    confidence?: number;    // → CONF. (decimal 0–1, x100 → %)
    aiDiagnosis?: string;   // → AI DIAGNOSIS badge text
  };
  createdAt: string;
  updatedAt: string;
}

export interface LpBatchLandingPagesParams {
  productId?: string;
  status?: LpBatchLpStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface LpBatchLandingPagesListResponse {
  data: ApiLpBatchLandingPage[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface TransitionLpStatusDto {
  toStatus: 'DRAFT' | 'PUBLISHED';
}
