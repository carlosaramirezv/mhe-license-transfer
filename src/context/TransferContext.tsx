import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type {
  TransferPreview,
  TransactionType,
  AuditRecord,
  BatchJob,
  BatchRecord,
  BatchValidationResult,
  BatchStatus,
} from '../types';
import {
  mockDistributors,
  mockEndCustomers,
  mockProducts,
  mockDistributorLicenses,
  mockEndCustomerLicenses,
  mockAuditRecords,
  mockBatchJobs,
  getDistributorById,
  getEndCustomerById,
  getProductById,
  getProductByIsbn,
  getLicenseForAccountAndProduct,
} from '../data/mockData';
import { generateId, sleep } from '../lib/utils';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

interface TransferContextType {
  auditRecords: AuditRecord[];
  batchJobs: BatchJob[];
  currentBatchJob: BatchJob | null;
  generateTransferPreview: (
    distributorId: string,
    endCustomerId: string,
    productId: string,
    quantity: number,
    transactionType: TransactionType,
    metadata?: {
      startDate?: Date;
      endDate?: Date;
      contractNumber?: string;
      poNumber?: string;
      caseId?: string;
      notes?: string;
    }
  ) => TransferPreview | null;
  executeTransfer: (preview: TransferPreview) => Promise<AuditRecord>;
  validateBatchRecords: (records: BatchRecord[]) => BatchValidationResult[];
  processBatch: (job: BatchJob) => void;
  getBatchJobStatus: (jobId: string) => BatchJob | undefined;
  createBatchJob: (fileName: string, records: BatchRecord[]) => BatchJob;
}

const TransferContext = createContext<TransferContextType | undefined>(undefined);

export function TransferProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>(mockAuditRecords);
  const [batchJobs, setBatchJobs] = useState<BatchJob[]>(mockBatchJobs);
  const [currentBatchJob, setCurrentBatchJob] = useState<BatchJob | null>(null);

  const generateTransferPreview = useCallback((
    distributorId: string,
    endCustomerId: string,
    productId: string,
    quantity: number,
    transactionType: TransactionType,
    metadata?: {
      startDate?: Date;
      endDate?: Date;
      contractNumber?: string;
      poNumber?: string;
      caseId?: string;
      notes?: string;
    }
  ): TransferPreview | null => {
    const distributor = getDistributorById(distributorId);
    const endCustomer = getEndCustomerById(endCustomerId);
    const product = getProductById(productId);

    if (!distributor || !endCustomer || !product) {
      return null;
    }

    const validationErrors: string[] = [];
    const warnings: string[] = [];

    if (endCustomer.distributorId !== distributorId) {
      validationErrors.push('End customer does not belong to the selected distributor');
    }

    const distributorLicense = getLicenseForAccountAndProduct(distributorId, productId, 'distributor');
    const endCustomerLicense = getLicenseForAccountAndProduct(endCustomerId, productId, 'end_customer');

    const distributorCurrentQty = distributorLicense
      ? distributorLicense.quantity - distributorLicense.quantityUsed
      : 0;
    const endCustomerCurrentQty = endCustomerLicense?.quantity || 0;

    let distributorNewQty = distributorCurrentQty;
    let endCustomerNewQty = endCustomerCurrentQty;

    switch (transactionType) {
      case 'sale':
        if (quantity > distributorCurrentQty) {
          validationErrors.push(
            `Insufficient distributor licenses. Available: ${distributorCurrentQty}, Requested: ${quantity}`
          );
        }
        distributorNewQty = distributorCurrentQty - quantity;
        endCustomerNewQty = endCustomerCurrentQty + quantity;
        break;

      case 'cancellation':
        if (quantity > endCustomerCurrentQty) {
          validationErrors.push(
            `Cannot cancel more licenses than customer has. Current: ${endCustomerCurrentQty}, Requested: ${quantity}`
          );
        }
        distributorNewQty = distributorCurrentQty + quantity;
        endCustomerNewQty = endCustomerCurrentQty - quantity;
        break;

      case 'extension':
        if (!endCustomerLicense) {
          validationErrors.push('End customer has no existing license to extend');
        }
        break;
    }

    if (quantity <= 0) {
      validationErrors.push('Quantity must be greater than zero');
    }

    if (distributor.status === 'inactive') {
      warnings.push('Distributor account is inactive');
    }

    if (endCustomer.status === 'inactive') {
      warnings.push('End customer account is inactive');
    }

    if (distributorNewQty < 100 && transactionType === 'sale') {
      warnings.push(`Distributor will have low inventory after transfer (${distributorNewQty} remaining)`);
    }

    return {
      distributorAccount: distributor,
      endCustomerAccount: endCustomer,
      product,
      transactionType,
      quantity,
      distributorCurrentQuantity: distributorCurrentQty,
      distributorNewQuantity: distributorNewQty,
      endCustomerCurrentQuantity: endCustomerCurrentQty,
      endCustomerNewQuantity: endCustomerNewQty,
      startDate: metadata?.startDate,
      endDate: metadata?.endDate,
      contractNumber: metadata?.contractNumber,
      poNumber: metadata?.poNumber,
      caseId: metadata?.caseId,
      notes: metadata?.notes,
      validationErrors,
      warnings,
    };
  }, []);

  const executeTransfer = useCallback(async (preview: TransferPreview): Promise<AuditRecord> => {
    await sleep(1500);

    const shouldFail = Math.random() < 0.05;

    const auditRecord: AuditRecord = {
      id: generateId(),
      timestamp: new Date(),
      userId: user?.id || 'unknown',
      userName: user?.name || 'Unknown User',
      distributorId: preview.distributorAccount.id,
      distributorName: preview.distributorAccount.name,
      endCustomerId: preview.endCustomerAccount.id,
      endCustomerName: preview.endCustomerAccount.name,
      productId: preview.product.id,
      productIsbn: preview.product.isbn,
      productTitle: preview.product.title,
      transactionType: preview.transactionType,
      quantityBefore: preview.endCustomerCurrentQuantity,
      quantityAfter: shouldFail ? preview.endCustomerCurrentQuantity : preview.endCustomerNewQuantity,
      distributorQuantityBefore: preview.distributorCurrentQuantity,
      distributorQuantityAfter: shouldFail ? preview.distributorCurrentQuantity : preview.distributorNewQuantity,
      startDate: preview.startDate,
      endDate: preview.endDate,
      status: shouldFail ? 'failed' : 'applied',
      errorDetails: shouldFail ? 'Database connection timeout - transaction rolled back' : undefined,
      contractNumber: preview.contractNumber,
      poNumber: preview.poNumber,
      caseId: preview.caseId,
      notes: preview.notes,
    };

    setAuditRecords(prev => [auditRecord, ...prev]);

    if (shouldFail) {
      notify(
        'transferFailed',
        'Transfer Failed',
        `${preview.product.title} — ${preview.transactionType} of ${preview.quantity} licenses failed`
      );
      throw new Error(auditRecord.errorDetails);
    }

    notify(
      'transferComplete',
      'Transfer Complete',
      `${preview.product.title} — ${preview.transactionType} of ${preview.quantity} licenses applied`
    );

    if (preview.transactionType === 'sale' && preview.distributorNewQuantity < 100) {
      notify(
        'lowInventory',
        'Low Distributor Inventory',
        `${preview.distributorAccount.name} has only ${preview.distributorNewQuantity} licenses remaining for ${preview.product.title}`
      );
    }

    if (!shouldFail) {
      const distLicense = mockDistributorLicenses.find(
        l => l.accountId === preview.distributorAccount.id && l.productId === preview.product.id
      );
      const custLicense = mockEndCustomerLicenses.find(
        l => l.accountId === preview.endCustomerAccount.id && l.productId === preview.product.id
      );

      if (preview.transactionType === 'sale') {
        if (distLicense) {
          distLicense.quantityUsed += preview.quantity;
        }
        if (custLicense) {
          custLicense.quantity += preview.quantity;
        } else {
          mockEndCustomerLicenses.push({
            id: generateId(),
            productId: preview.product.id,
            accountId: preview.endCustomerAccount.id,
            accountType: 'end_customer',
            quantity: preview.quantity,
            quantityUsed: 0,
            startDate: preview.startDate || new Date(),
            endDate: preview.endDate || new Date(Date.now() + preview.product.defaultTermMonths * 30 * 24 * 60 * 60 * 1000),
            status: 'active',
          });
        }
      } else if (preview.transactionType === 'cancellation') {
        if (distLicense) {
          distLicense.quantityUsed -= preview.quantity;
        }
        if (custLicense) {
          custLicense.quantity -= preview.quantity;
        }
      }
    }

    return auditRecord;
  }, [user]);

  const validateBatchRecords = useCallback((records: BatchRecord[]): BatchValidationResult[] => {
    return records.map((record, index) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      const distributor = mockDistributors.find(d => d.id === record.distributorId || d.code === record.distributorId);
      const endCustomer = mockEndCustomers.find(c => c.id === record.endCustomerId || c.schoolCode === record.endCustomerId);
      const product = getProductByIsbn(record.productIsbn) || mockProducts.find(p => p.id === record.productIsbn);

      if (!distributor) {
        errors.push(`Invalid distributor ID: ${record.distributorId}`);
      }

      if (!endCustomer) {
        errors.push(`Invalid end customer ID: ${record.endCustomerId}`);
      }

      if (!product) {
        errors.push(`Invalid product ISBN: ${record.productIsbn}`);
      }

      if (!['sale', 'cancellation', 'extension'].includes(record.transactionType)) {
        errors.push(`Invalid transaction type: ${record.transactionType}`);
      }

      if (record.quantity <= 0) {
        errors.push('Quantity must be greater than zero');
      }

      let preview: TransferPreview | undefined;

      if (distributor && endCustomer && product && errors.length === 0) {
        const generatedPreview = generateTransferPreview(
          distributor.id,
          endCustomer.id,
          product.id,
          record.quantity,
          record.transactionType,
          {
            contractNumber: record.contractNumber,
            poNumber: record.poNumber,
            caseId: record.caseId,
            notes: record.notes,
          }
        );

        if (generatedPreview) {
          preview = generatedPreview;
          errors.push(...generatedPreview.validationErrors);
          warnings.push(...generatedPreview.warnings);
        }
      }

      return {
        rowNumber: record.rowNumber || index + 1,
        isValid: errors.length === 0,
        errors,
        warnings,
        preview,
      };
    });
  }, [generateTransferPreview]);

  const createBatchJob = useCallback((fileName: string, records: BatchRecord[]): BatchJob => {
    const validationResults = validateBatchRecords(records);

    const job: BatchJob = {
      id: generateId(),
      fileName,
      uploadedAt: new Date(),
      uploadedBy: user?.name || 'Unknown User',
      totalRecords: records.length,
      validRecords: validationResults.filter(r => r.isValid).length,
      invalidRecords: validationResults.filter(r => !r.isValid).length,
      processedRecords: 0,
      status: 'validated',
      results: validationResults,
    };

    setBatchJobs(prev => [job, ...prev]);
    setCurrentBatchJob(job);

    return job;
  }, [user, validateBatchRecords]);

  const processBatch = useCallback(async (job: BatchJob) => {
    const updateJob = (updates: Partial<BatchJob>) => {
      setBatchJobs(prev =>
        prev.map(j => (j.id === job.id ? { ...j, ...updates } : j))
      );
      setCurrentBatchJob(current =>
        current?.id === job.id ? { ...current, ...updates } : current
      );
    };

    updateJob({ status: 'processing' as BatchStatus });

    const validResults = job.results.filter(r => r.isValid && r.preview);
    let processedCount = 0;

    for (const result of validResults) {
      if (result.preview) {
        try {
          await executeTransfer(result.preview);
        } catch {
          // Continue processing other records even if one fails
        }
      }
      processedCount++;
      updateJob({ processedRecords: processedCount });
    }

    updateJob({
      status: 'completed' as BatchStatus,
      processedRecords: validResults.length,
      completedAt: new Date(),
    });

    notify(
      'batchComplete',
      'Batch Processing Complete',
      `${job.fileName} — ${validResults.length} of ${job.totalRecords} records processed`
    );
  }, [executeTransfer, notify]);

  const getBatchJobStatus = useCallback((jobId: string): BatchJob | undefined => {
    return batchJobs.find(j => j.id === jobId);
  }, [batchJobs]);

  return (
    <TransferContext.Provider
      value={{
        auditRecords,
        batchJobs,
        currentBatchJob,
        generateTransferPreview,
        executeTransfer,
        validateBatchRecords,
        processBatch,
        getBatchJobStatus,
        createBatchJob,
      }}
    >
      {children}
    </TransferContext.Provider>
  );
}

export function useTransfer() {
  const context = useContext(TransferContext);
  if (context === undefined) {
    throw new Error('useTransfer must be used within a TransferProvider');
  }
  return context;
}
