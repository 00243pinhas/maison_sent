export type RoleName =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'WAREHOUSE_MANAGER'
  | 'BRANCH_MANAGER'
  | 'SALES_STAFF';

export type TransferStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export type MovementType =
  | 'RECEIVED'
  | 'SALE'
  | 'RETURN'
  | 'DAMAGE'
  | 'ADJUSTMENT_IN'
  | 'ADJUSTMENT_OUT'
  | 'TRANSFER';

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
export type LocationType = 'WAREHOUSE' | 'BRANCH' | 'HEAD_OFFICE';

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: RoleName;
  locationId: string | null;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Catalog entities ──────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  country: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  city: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  sku: string;
  barcode: string | null;
  categoryId: string;
  category: Category;
  supplierId: string;
  supplier: Supplier;
  costPrice: number;
  sellingPrice: number;
  sizeMl: number;
  status: ProductStatus;
  lowStockThreshold: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// ── Transfers ─────────────────────────────────────────────────────────────────

export interface TransferItem {
  id: string;
  transferId: string;
  productId: string;
  product: Product;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transfer {
  id: string;
  referenceNumber: string | null;
  fromLocationId: string;
  fromLocation: Location;
  toLocationId: string;
  toLocation: Location;
  status: TransferStatus;
  notes: string | null;
  rejectionReason: string | null;
  createdBy: string;
  creator?: AuthUser;
  approvedBy: string | null;
  approver?: AuthUser | null;
  approvedAt?: string | null;
  completedAt?: string | null;
  completedBy?: string | null;
  items?: TransferItem[];
  createdAt: string;
  updatedAt: string;
}

// ── Inventory ────────────────────────────────────────────────────────────────

export interface Movement {
  id: string;
  movementType: MovementType;
  quantity: number;
  unitCostPrice: string | null;
  unitSellingPrice: string | null;
  referenceNumber: string | null;
  notes: string | null;
  createdAt: string;
  productId: string;
  product: Product;
  fromLocationId: string | null;
  fromLocation: Location | null;
  toLocationId: string | null;
  toLocation: Location | null;
  performedById: string;
  performedBy: AuthUser;
}

export interface InventoryBalance {
  id: string;
  productId: string;
  product: Product;
  locationId: string;
  location: Location;
  quantity: number;
  updatedAt: string;
}

export interface ReconcileResult {
  replayedMovements: number;
  rebuiltBalances: number;
  durationMs: number;
}

// ── Notifications ─────────────────────────────────────────────────────────────

export type NotificationType =
  | 'TRANSFER_SUBMITTED'
  | 'TRANSFER_APPROVED'
  | 'TRANSFER_REJECTED'
  | 'TRANSFER_COMPLETED'
  | 'LOW_STOCK_ALERT';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data: Record<string, string> | null;
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}

// ── Reports ───────────────────────────────────────────────────────────────────

export interface InventoryValueReport {
  totalCostValue: string | null;
  totalSellingValue: string | null;
  totalUnits: string | null;
  distinctProducts: string | null;
  distinctLocations: string | null;
}

export interface MovementSummaryItem {
  movementType: MovementType;
  transactionCount: string;
  totalQuantity: string;
}

export interface AuditMovement {
  id: string;
  movementType: MovementType;
  quantity: number;
  unitCostPrice: string | null;
  unitSellingPrice: string | null;
  referenceNumber: string | null;
  notes: string | null;
  createdAt: string;
  productId: string;
  productName: string;
  sku: string;
  fromLocationName: string | null;
  toLocationName: string | null;
  performedByEmail: string;
}

export interface FastMoverItem {
  productId: string;
  productName: string;
  sku: string;
  unitsSold: string;
  totalRevenue: string;
}

export interface LowStockItem {
  productId: string;
  productName: string;
  sku: string;
  locationId: string;
  locationName: string;
  quantity: string;
}

export interface StockSummaryByLocation {
  locationId: string;
  locationName: string;
  locationType: string;
  productCount: number | string;
  totalQuantity: number | string;
  costValue: string;
  sellingValue: string;
}

export interface StockSummaryReport {
  totalProducts: number | string;
  totalQuantity: number | string;
  totalCostValue: string;
  totalSellingValue: string;
  byLocation: StockSummaryByLocation[];
}

export interface StockByLocationItem {
  productId: string;
  productName: string;
  sku: string;
  brand: string;
  sizeMl: number;
  quantity: number;
  costValue: string;
  sellingValue: string;
}

export interface DeadStockItem {
  productId: string;
  productName: string;
  sku: string;
  brand: string;
  currentQuantity: number;
  currentCostValue: string;
  daysSinceLastSale: number | null;
}

export interface SalesByPeriodItem {
  period: string;
  totalSales: number | string;
  totalRevenue: string;
  totalReturnsValue: string;
  netRevenue: string;
}

export interface RevenueSummaryReport {
  totalRevenue: string;
  totalCOGS: string;
  grossMargin: string;
  netRevenue: string;
  returnValue: string;
}

export interface TransferReportTopRoute {
  fromLocationId: string;
  fromLocationName: string;
  toLocationId: string;
  toLocationName: string;
  count: number;
  totalQuantity: number;
}

export interface TransferReportStats {
  totalTransfers: number;
  byStatus: Partial<Record<TransferStatus, number>>;
  avgSubmitToApproveHours: number | null;
  avgApproveToCompleteHours: number | null;
  topRoutes: TransferReportTopRoute[];
}

export interface BranchPerformanceItem {
  locationId: string;
  locationName: string;
  locationType: string;
  salesTransactions: string;
  unitsSold: string;
  totalRevenue: string;
  totalCost: string;
}

// ── Jobs / Queues ─────────────────────────────────────────────────────────────

// Flat shape returned by the backend's getQueueStats (counts, not nested)
export interface QueueStats {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number; // count of paused jobs, NOT a boolean queue-level flag
}

export interface QueueStatsResponse {
  notifications: QueueStats;
  scheduled: QueueStats;
}

export interface FailedJob {
  id: string;
  name: string;
  timestamp: number;
  failedReason: string;
  attemptsMade: number;
}

export type ScheduledJobResult = Record<string, unknown>;
