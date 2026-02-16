import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Select,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useTransfer } from '../context/TransferContext';
import { mockDistributors, mockEndCustomers, mockProducts, mockUsers } from '../data/mockData';
import { formatDateTime, downloadCSV } from '../lib/utils';
import type { AuditRecord, AuditFilters, TransactionType, TransactionStatus } from '../types';

const PAGE_SIZE = 10;

export default function AuditLogPage() {
  const { canExportAuditLog } = useAuth();
  const { auditRecords } = useTransfer();

  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null);

  const [filters, setFilters] = useState<AuditFilters>({
    dateFrom: undefined,
    dateTo: undefined,
    distributorId: undefined,
    endCustomerId: undefined,
    productId: undefined,
    transactionType: undefined,
    status: undefined,
    userId: undefined,
  });

  const filteredRecords = useMemo(() => {
    return auditRecords.filter(record => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          record.distributorName.toLowerCase().includes(search) ||
          record.endCustomerName.toLowerCase().includes(search) ||
          record.productTitle.toLowerCase().includes(search) ||
          record.productIsbn.toLowerCase().includes(search) ||
          record.userName.toLowerCase().includes(search) ||
          record.contractNumber?.toLowerCase().includes(search) ||
          record.poNumber?.toLowerCase().includes(search) ||
          record.caseId?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      if (filters.dateFrom && new Date(record.timestamp) < filters.dateFrom) return false;
      if (filters.dateTo && new Date(record.timestamp) > filters.dateTo) return false;
      if (filters.distributorId && record.distributorId !== filters.distributorId) return false;
      if (filters.endCustomerId && record.endCustomerId !== filters.endCustomerId) return false;
      if (filters.productId && record.productId !== filters.productId) return false;
      if (filters.transactionType && record.transactionType !== filters.transactionType) return false;
      if (filters.status && record.status !== filters.status) return false;
      if (filters.userId && record.userId !== filters.userId) return false;

      return true;
    });
  }, [auditRecords, searchTerm, filters]);

  const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleClearFilters = () => {
    setFilters({
      dateFrom: undefined,
      dateTo: undefined,
      distributorId: undefined,
      endCustomerId: undefined,
      productId: undefined,
      transactionType: undefined,
      status: undefined,
      userId: undefined,
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleExport = () => {
    const exportData = filteredRecords.map(r => ({
      timestamp: r.timestamp.toISOString(),
      user: r.userName,
      distributor: r.distributorName,
      end_customer: r.endCustomerName,
      product: r.productTitle,
      isbn: r.productIsbn,
      transaction_type: r.transactionType,
      quantity_before: r.quantityBefore,
      quantity_after: r.quantityAfter,
      status: r.status,
      contract_number: r.contractNumber || '',
      po_number: r.poNumber || '',
      case_id: r.caseId || '',
      notes: r.notes || '',
      error_details: r.errorDetails || '',
    }));

    downloadCSV(exportData, `audit_log_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const statusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'applied':
        return <Badge variant="success">Applied</Badge>;
      case 'failed':
        return <Badge variant="error">Failed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'rolled_back':
        return <Badge variant="warning">Rolled Back</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const transactionTypeBadge = (type: TransactionType) => {
    switch (type) {
      case 'sale':
        return <Badge variant="info">Sale</Badge>;
      case 'cancellation':
        return <Badge variant="warning">Cancellation</Badge>;
      case 'extension':
        return <Badge variant="success">Extension</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <Layout title="Audit Log" subtitle="View and search all license transfer records">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transfer History</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 h-9"
                />
              </div>
              <Button
                variant={showFilters ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="info" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
              {canExportAuditLog && (
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </CardHeader>

          {showFilters && (
            <div className="px-6 pb-4 border-b border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date From</label>
                  <Input
                    type="date"
                    value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
                    onChange={(e) =>
                      setFilters({ ...filters, dateFrom: e.target.value ? new Date(e.target.value) : undefined })
                    }
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date To</label>
                  <Input
                    type="date"
                    value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
                    onChange={(e) =>
                      setFilters({ ...filters, dateTo: e.target.value ? new Date(e.target.value) : undefined })
                    }
                    className="h-9"
                  />
                </div>
                <Select
                  label="Distributor"
                  value={filters.distributorId || ''}
                  onChange={(e) => setFilters({ ...filters, distributorId: e.target.value || undefined })}
                  placeholder="All distributors"
                  options={[
                    { value: '', label: 'All distributors' },
                    ...mockDistributors.map(d => ({ value: d.id, label: d.name })),
                  ]}
                />
                <Select
                  label="End Customer"
                  value={filters.endCustomerId || ''}
                  onChange={(e) => setFilters({ ...filters, endCustomerId: e.target.value || undefined })}
                  placeholder="All customers"
                  options={[
                    { value: '', label: 'All customers' },
                    ...mockEndCustomers.map(c => ({ value: c.id, label: c.name })),
                  ]}
                />
                <Select
                  label="Product"
                  value={filters.productId || ''}
                  onChange={(e) => setFilters({ ...filters, productId: e.target.value || undefined })}
                  placeholder="All products"
                  options={[
                    { value: '', label: 'All products' },
                    ...mockProducts.map(p => ({ value: p.id, label: p.title })),
                  ]}
                />
                <Select
                  label="Transaction Type"
                  value={filters.transactionType || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, transactionType: (e.target.value as TransactionType) || undefined })
                  }
                  placeholder="All types"
                  options={[
                    { value: '', label: 'All types' },
                    { value: 'sale', label: 'Sale' },
                    { value: 'cancellation', label: 'Cancellation' },
                    { value: 'extension', label: 'Extension' },
                  ]}
                />
                <Select
                  label="Status"
                  value={filters.status || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, status: (e.target.value as TransactionStatus) || undefined })
                  }
                  placeholder="All statuses"
                  options={[
                    { value: '', label: 'All statuses' },
                    { value: 'applied', label: 'Applied' },
                    { value: 'failed', label: 'Failed' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'rolled_back', label: 'Rolled Back' },
                  ]}
                />
                <Select
                  label="User"
                  value={filters.userId || ''}
                  onChange={(e) => setFilters({ ...filters, userId: e.target.value || undefined })}
                  placeholder="All users"
                  options={[
                    { value: '', label: 'All users' },
                    ...mockUsers.map(u => ({ value: u.id, label: u.name })),
                  ]}
                />
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          )}

          <CardContent className="p-0">
            {paginatedRecords.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No records found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Accounts</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {formatDateTime(record.timestamp)}
                        </span>
                      </TableCell>
                      <TableCell>{transactionTypeBadge(record.transactionType)}</TableCell>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                            {record.productTitle}
                          </p>
                          <p className="text-xs text-gray-500">{record.productIsbn}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">From:</p>
                          <p className="text-sm text-gray-900 truncate max-w-[150px]">
                            {record.distributorName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">To:</p>
                          <p className="text-sm text-gray-900 truncate max-w-[150px]">
                            {record.endCustomerName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="text-gray-500">{record.quantityBefore}</span>
                          <span className="mx-1">→</span>
                          <span
                            className={
                              record.quantityAfter > record.quantityBefore
                                ? 'text-green-600 font-medium'
                                : record.quantityAfter < record.quantityBefore
                                ? 'text-red-600 font-medium'
                                : 'text-gray-900'
                            }
                          >
                            {record.quantityAfter}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{statusBadge(record.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{record.userName}</span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRecord(record)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>

          {filteredRecords.length > PAGE_SIZE && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {(currentPage - 1) * PAGE_SIZE + 1} to{' '}
                {Math.min(currentPage * PAGE_SIZE, filteredRecords.length)} of {filteredRecords.length} records
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Dialog
        open={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        className="w-full max-w-2xl"
      >
        {selectedRecord && (
          <>
            <DialogHeader onClose={() => setSelectedRecord(null)}>
              <DialogTitle>Transfer Details</DialogTitle>
            </DialogHeader>
            <DialogContent>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  {transactionTypeBadge(selectedRecord.transactionType)}
                  {statusBadge(selectedRecord.status)}
                  <span className="text-sm text-gray-500">
                    {formatDateTime(selectedRecord.timestamp)}
                  </span>
                </div>

                {selectedRecord.errorDetails && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-red-800">Error Details</p>
                    <p className="text-sm text-red-700 mt-1">{selectedRecord.errorDetails}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Product</h4>
                    <p className="font-medium text-gray-900">{selectedRecord.productTitle}</p>
                    <p className="text-sm text-gray-500">{selectedRecord.productIsbn}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">User</h4>
                    <p className="font-medium text-gray-900">{selectedRecord.userName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Distributor</h4>
                    <p className="font-medium text-gray-900">{selectedRecord.distributorName}</p>
                    <div className="text-sm mt-2">
                      <span className="text-gray-500">Quantity: </span>
                      <span>{selectedRecord.distributorQuantityBefore}</span>
                      <span className="mx-1">→</span>
                      <span
                        className={
                          selectedRecord.distributorQuantityAfter < selectedRecord.distributorQuantityBefore
                            ? 'text-red-600 font-medium'
                            : 'text-green-600 font-medium'
                        }
                      >
                        {selectedRecord.distributorQuantityAfter}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">End Customer</h4>
                    <p className="font-medium text-gray-900">{selectedRecord.endCustomerName}</p>
                    <div className="text-sm mt-2">
                      <span className="text-gray-500">Quantity: </span>
                      <span>{selectedRecord.quantityBefore}</span>
                      <span className="mx-1">→</span>
                      <span
                        className={
                          selectedRecord.quantityAfter > selectedRecord.quantityBefore
                            ? 'text-green-600 font-medium'
                            : 'text-red-600 font-medium'
                        }
                      >
                        {selectedRecord.quantityAfter}
                      </span>
                    </div>
                  </div>
                </div>

                {(selectedRecord.contractNumber || selectedRecord.poNumber || selectedRecord.caseId) && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Reference Information</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {selectedRecord.contractNumber && (
                        <div>
                          <span className="text-gray-500">Contract: </span>
                          <span className="font-medium">{selectedRecord.contractNumber}</span>
                        </div>
                      )}
                      {selectedRecord.poNumber && (
                        <div>
                          <span className="text-gray-500">PO: </span>
                          <span className="font-medium">{selectedRecord.poNumber}</span>
                        </div>
                      )}
                      {selectedRecord.caseId && (
                        <div>
                          <span className="text-gray-500">Case ID: </span>
                          <span className="font-medium">{selectedRecord.caseId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedRecord.notes && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                    <p className="text-sm text-gray-600">{selectedRecord.notes}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Audit ID</h4>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{selectedRecord.id}</code>
                </div>
              </div>
            </DialogContent>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedRecord(null)}>
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </Layout>
  );
}
