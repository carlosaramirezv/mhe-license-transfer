import { useState, useMemo } from 'react';
import { ArrowRight, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
  Select,
  Textarea,
  Alert,
  Badge,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useTransfer } from '../context/TransferContext';
import {
  mockDistributors,
  mockProducts,
  getEndCustomersByDistributor,
  getDistributorLicenses,
  getLicenseForAccountAndProduct,
} from '../data/mockData';
import { formatDate } from '../lib/utils';
import type { TransferPreview, TransactionType } from '../types';

export default function TransferPage() {
  const { canPerformTransfers } = useAuth();
  const { generateTransferPreview, executeTransfer } = useTransfer();

  const [distributorId, setDistributorId] = useState('');
  const [endCustomerId, setEndCustomerId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [transactionType, setTransactionType] = useState<TransactionType>('sale');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [caseId, setCaseId] = useState('');
  const [notes, setNotes] = useState('');

  const [preview, setPreview] = useState<TransferPreview | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const activeDistributors = mockDistributors.filter(d => d.status === 'active');

  const endCustomers = useMemo(() => {
    if (!distributorId) return [];
    return getEndCustomersByDistributor(distributorId);
  }, [distributorId]);

  const availableProducts = useMemo(() => {
    if (!distributorId) return [];
    const licenses = getDistributorLicenses(distributorId);
    return mockProducts.filter(p =>
      licenses.some(l => l.productId === p.id && l.status === 'active')
    );
  }, [distributorId]);

  const selectedDistributorLicense = useMemo(() => {
    if (!distributorId || !productId) return null;
    return getLicenseForAccountAndProduct(distributorId, productId, 'distributor');
  }, [distributorId, productId]);

  const selectedEndCustomerLicense = useMemo(() => {
    if (!endCustomerId || !productId) return null;
    return getLicenseForAccountAndProduct(endCustomerId, productId, 'end_customer');
  }, [endCustomerId, productId]);

  const availableQuantity = selectedDistributorLicense
    ? selectedDistributorLicense.quantity - selectedDistributorLicense.quantityUsed
    : 0;

  const handleDistributorChange = (value: string) => {
    setDistributorId(value);
    setEndCustomerId('');
    setProductId('');
  };

  const handleGeneratePreview = () => {
    const generatedPreview = generateTransferPreview(
      distributorId,
      endCustomerId,
      productId,
      parseInt(quantity, 10),
      transactionType,
      {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        contractNumber: contractNumber || undefined,
        poNumber: poNumber || undefined,
        caseId: caseId || undefined,
        notes: notes || undefined,
      }
    );

    if (generatedPreview) {
      setPreview(generatedPreview);
      setShowPreviewDialog(true);
      setExecutionResult(null);
      setErrorMessage('');
    }
  };

  const handleExecuteTransfer = async () => {
    if (!preview) return;

    setIsExecuting(true);
    setErrorMessage('');

    try {
      await executeTransfer(preview);
      setExecutionResult('success');
      setTimeout(() => {
        setShowPreviewDialog(false);
        resetForm();
      }, 2000);
    } catch (error) {
      setExecutionResult('error');
      setErrorMessage(error instanceof Error ? error.message : 'Transfer failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const resetForm = () => {
    setDistributorId('');
    setEndCustomerId('');
    setProductId('');
    setQuantity('');
    setTransactionType('sale');
    setStartDate('');
    setEndDate('');
    setContractNumber('');
    setPoNumber('');
    setCaseId('');
    setNotes('');
    setPreview(null);
    setExecutionResult(null);
    setErrorMessage('');
  };

  const canGeneratePreview =
    distributorId &&
    endCustomerId &&
    productId &&
    quantity &&
    parseInt(quantity, 10) > 0 &&
    canPerformTransfers;

  if (!canPerformTransfers) {
    return (
      <Layout title="License Transfer" subtitle="Transfer licenses between accounts">
        <Alert variant="warning" title="Access Restricted">
          You do not have permission to perform license transfers. Please contact an administrator.
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout title="License Transfer" subtitle="Transfer licenses between distributor and end customer accounts">
      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>New License Transfer</CardTitle>
            <CardDescription>
              Select the accounts, product, and quantity to transfer. A preview will be generated before applying.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Transaction Type"
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value as TransactionType)}
                options={[
                  { value: 'sale', label: 'Sale - Transfer to End Customer' },
                  { value: 'cancellation', label: 'Cancellation - Return to Distributor' },
                  { value: 'extension', label: 'Extension - Extend License Term' },
                ]}
              />
              <div />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Account Selection</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Distributor Account"
                  value={distributorId}
                  onChange={(e) => handleDistributorChange(e.target.value)}
                  placeholder="Select distributor..."
                  options={activeDistributors.map(d => ({
                    value: d.id,
                    label: `${d.name} (${d.code})`,
                  }))}
                />

                <Select
                  label="End Customer Account"
                  value={endCustomerId}
                  onChange={(e) => setEndCustomerId(e.target.value)}
                  placeholder={distributorId ? 'Select end customer...' : 'Select distributor first...'}
                  disabled={!distributorId}
                  options={endCustomers.map(c => ({
                    value: c.id,
                    label: `${c.name} (${c.schoolCode || 'No code'})`,
                  }))}
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Product & Quantity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Product"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  placeholder={distributorId ? 'Select product...' : 'Select distributor first...'}
                  disabled={!distributorId}
                  options={availableProducts.map(p => ({
                    value: p.id,
                    label: `${p.title} (${p.isbn})`,
                  }))}
                  helperText={
                    selectedDistributorLicense
                      ? `Available: ${availableQuantity} licenses`
                      : undefined
                  }
                />

                <Input
                  label="Quantity"
                  type="number"
                  min="1"
                  max={transactionType === 'sale' ? availableQuantity : undefined}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity..."
                  helperText={
                    transactionType === 'sale'
                      ? `Max available: ${availableQuantity}`
                      : transactionType === 'cancellation' && selectedEndCustomerLicense
                      ? `Customer has: ${selectedEndCustomerLicense.quantity} licenses`
                      : undefined
                  }
                />
              </div>
            </div>

            {transactionType !== 'extension' && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">License Term (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <Input
                    label="End Date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            {transactionType === 'extension' && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Extension Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="New End Date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    helperText={
                      selectedEndCustomerLicense
                        ? `Current end date: ${formatDate(selectedEndCustomerLicense.endDate)}`
                        : undefined
                    }
                  />
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Reference Information (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="Contract Number"
                  value={contractNumber}
                  onChange={(e) => setContractNumber(e.target.value)}
                  placeholder="CON-XXXX-XXX"
                />
                <Input
                  label="PO Number"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  placeholder="PO-XXX-XXXX-XXX"
                />
                <Input
                  label="Case/Ticket ID"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  placeholder="CASE-XXXX-XXXX"
                />
              </div>
              <div className="mt-4">
                <Textarea
                  label="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes or comments..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={resetForm}>
              Clear Form
            </Button>
            <Button
              onClick={handleGeneratePreview}
              disabled={!canGeneratePreview}
            >
              Preview Transfer
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Dialog
        open={showPreviewDialog}
        onClose={() => !isExecuting && setShowPreviewDialog(false)}
        className="w-full max-w-2xl"
      >
        <DialogHeader onClose={() => !isExecuting && setShowPreviewDialog(false)}>
          <DialogTitle>Transfer Preview</DialogTitle>
          <DialogDescription>
            Review the details below before applying this transfer
          </DialogDescription>
        </DialogHeader>

        {preview && (
          <DialogContent className="space-y-6">
            {executionResult === 'success' && (
              <Alert variant="success" title="Transfer Successful">
                The license transfer has been applied and recorded in the audit log.
              </Alert>
            )}

            {executionResult === 'error' && (
              <Alert variant="error" title="Transfer Failed">
                {errorMessage}
              </Alert>
            )}

            {preview.validationErrors.length > 0 && (
              <Alert variant="error" title="Validation Errors">
                <ul className="list-disc list-inside space-y-1">
                  {preview.validationErrors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </Alert>
            )}

            {preview.warnings.length > 0 && (
              <Alert variant="warning" title="Warnings">
                <ul className="list-disc list-inside space-y-1">
                  {preview.warnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </Alert>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge
                  variant={
                    preview.transactionType === 'sale'
                      ? 'info'
                      : preview.transactionType === 'cancellation'
                      ? 'warning'
                      : 'success'
                  }
                >
                  {preview.transactionType.charAt(0).toUpperCase() + preview.transactionType.slice(1)}
                </Badge>
              </div>
              <h4 className="font-medium text-gray-900">{preview.product.title}</h4>
              <p className="text-sm text-gray-500">{preview.product.isbn}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Distributor</p>
                <p className="font-medium text-gray-900 text-sm truncate">
                  {preview.distributorAccount.name}
                </p>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Current</span>
                    <span className="font-medium">{preview.distributorCurrentQuantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">After</span>
                    <span
                      className={`font-medium ${
                        preview.distributorNewQuantity < preview.distributorCurrentQuantity
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {preview.distributorNewQuantity}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-1 border-t">
                    <span className="text-gray-500">Change</span>
                    <span
                      className={`font-medium ${
                        preview.distributorNewQuantity - preview.distributorCurrentQuantity < 0
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {preview.distributorNewQuantity - preview.distributorCurrentQuantity > 0 ? '+' : ''}
                      {preview.distributorNewQuantity - preview.distributorCurrentQuantity}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="h-6 w-6 text-gray-400" />
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">End Customer</p>
                <p className="font-medium text-gray-900 text-sm truncate">
                  {preview.endCustomerAccount.name}
                </p>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Current</span>
                    <span className="font-medium">{preview.endCustomerCurrentQuantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">After</span>
                    <span
                      className={`font-medium ${
                        preview.endCustomerNewQuantity > preview.endCustomerCurrentQuantity
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {preview.endCustomerNewQuantity}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-1 border-t">
                    <span className="text-gray-500">Change</span>
                    <span
                      className={`font-medium ${
                        preview.endCustomerNewQuantity - preview.endCustomerCurrentQuantity > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {preview.endCustomerNewQuantity - preview.endCustomerCurrentQuantity > 0 ? '+' : ''}
                      {preview.endCustomerNewQuantity - preview.endCustomerCurrentQuantity}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {(preview.startDate || preview.endDate) && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">License Term</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {preview.startDate && (
                    <div>
                      <span className="text-gray-500">Start Date:</span>{' '}
                      <span className="font-medium">{formatDate(preview.startDate)}</span>
                    </div>
                  )}
                  {preview.endDate && (
                    <div>
                      <span className="text-gray-500">End Date:</span>{' '}
                      <span className="font-medium">{formatDate(preview.endDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(preview.contractNumber || preview.poNumber || preview.caseId) && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Reference Information</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {preview.contractNumber && (
                    <div>
                      <span className="text-gray-500">Contract:</span>{' '}
                      <span className="font-medium">{preview.contractNumber}</span>
                    </div>
                  )}
                  {preview.poNumber && (
                    <div>
                      <span className="text-gray-500">PO:</span>{' '}
                      <span className="font-medium">{preview.poNumber}</span>
                    </div>
                  )}
                  {preview.caseId && (
                    <div>
                      <span className="text-gray-500">Case ID:</span>{' '}
                      <span className="font-medium">{preview.caseId}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {preview.notes && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-600">{preview.notes}</p>
              </div>
            )}
          </DialogContent>
        )}

        <DialogFooter>
          {executionResult === 'success' ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span>Transfer completed</span>
            </div>
          ) : executionResult === 'error' ? (
            <>
              <div className="flex items-center gap-2 text-red-600 mr-auto">
                <XCircle className="h-5 w-5" />
                <span>Transfer failed</span>
              </div>
              <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
                Close
              </Button>
              <Button onClick={handleExecuteTransfer} loading={isExecuting}>
                Retry
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setShowPreviewDialog(false)}
                disabled={isExecuting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExecuteTransfer}
                loading={isExecuting}
                disabled={preview?.validationErrors.length ? preview.validationErrors.length > 0 : false}
              >
                {preview?.warnings.length ? (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Apply Anyway
                  </>
                ) : (
                  'Apply Transfer'
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </Dialog>
    </Layout>
  );
}
