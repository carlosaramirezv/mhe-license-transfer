export type UserRole = 'viewer' | 'operator' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  lastLogin?: Date;
}

export interface DistributorAccount {
  id: string;
  name: string;
  code: string;
  region: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface EndCustomerAccount {
  id: string;
  name: string;
  distributorId: string;
  schoolCode?: string;
  address?: string;
  contactEmail?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface Product {
  id: string;
  isbn: string;
  title: string;
  type: 'digital' | 'subscription';
  defaultTermMonths: number;
}

export interface License {
  id: string;
  productId: string;
  accountId: string;
  accountType: 'distributor' | 'end_customer';
  quantity: number;
  quantityUsed: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'cancelled';
}

export type TransactionType = 'sale' | 'cancellation' | 'extension';
export type TransactionStatus = 'pending' | 'applied' | 'failed' | 'rolled_back';

export interface AuditRecord {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  distributorId: string;
  distributorName: string;
  endCustomerId: string;
  endCustomerName: string;
  productId: string;
  productIsbn: string;
  productTitle: string;
  transactionType: TransactionType;
  quantityBefore: number;
  quantityAfter: number;
  distributorQuantityBefore: number;
  distributorQuantityAfter: number;
  startDate?: Date;
  endDate?: Date;
  status: TransactionStatus;
  errorDetails?: string;
  contractNumber?: string;
  poNumber?: string;
  caseId?: string;
  notes?: string;
}

export interface TransferPreview {
  distributorAccount: DistributorAccount;
  endCustomerAccount: EndCustomerAccount;
  product: Product;
  transactionType: TransactionType;
  quantity: number;
  distributorCurrentQuantity: number;
  distributorNewQuantity: number;
  endCustomerCurrentQuantity: number;
  endCustomerNewQuantity: number;
  startDate?: Date;
  endDate?: Date;
  contractNumber?: string;
  poNumber?: string;
  caseId?: string;
  notes?: string;
  validationErrors: string[];
  warnings: string[];
}

export interface BatchRecord {
  rowNumber: number;
  distributorId: string;
  endCustomerId: string;
  productIsbn: string;
  quantity: number;
  transactionType: TransactionType;
  contractNumber?: string;
  poNumber?: string;
  caseId?: string;
  notes?: string;
}

export interface BatchValidationResult {
  rowNumber: number;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  preview?: TransferPreview;
}

export type BatchStatus = 'idle' | 'uploading' | 'validating' | 'validated' | 'processing' | 'completed' | 'failed';

export interface BatchJob {
  id: string;
  fileName: string;
  uploadedAt: Date;
  uploadedBy: string;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  processedRecords: number;
  status: BatchStatus;
  results: BatchValidationResult[];
  completedAt?: Date;
  errorMessage?: string;
}

export interface AuditFilters {
  dateFrom?: Date;
  dateTo?: Date;
  distributorId?: string;
  endCustomerId?: string;
  productId?: string;
  transactionType?: TransactionType;
  status?: TransactionStatus;
  userId?: string;
  searchTerm?: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
