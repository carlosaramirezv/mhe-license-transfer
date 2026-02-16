import { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Play,
  Loader2,
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Alert,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useTransfer } from '../context/TransferContext';
import { parseCSV, formatDateTime, downloadCSV } from '../lib/utils';
import type { BatchRecord, BatchJob, TransactionType } from '../types';

export default function BatchUploadPage() {
  const { canUploadBatches } = useAuth();
  const { batchJobs, currentBatchJob, createBatchJob, processBatch } = useTransfer();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [activeJob, setActiveJob] = useState<BatchJob | null>(null);

  useEffect(() => {
    if (currentBatchJob) {
      setActiveJob(currentBatchJob);
    }
  }, [currentBatchJob]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setUploadError('');

    if (!file.name.endsWith('.csv')) {
      setUploadError('Please upload a CSV file');
      return;
    }

    try {
      const content = await file.text();
      const parsedData = parseCSV(content);

      if (parsedData.length === 0) {
        setUploadError('The CSV file is empty or has no valid data rows');
        return;
      }

      const requiredFields = ['distributor_id', 'end_customer_id', 'product_isbn', 'quantity', 'transaction_type'];
      const headers = Object.keys(parsedData[0]);
      const missingFields = requiredFields.filter(f => !headers.includes(f));

      if (missingFields.length > 0) {
        setUploadError(`Missing required columns: ${missingFields.join(', ')}`);
        return;
      }

      const records: BatchRecord[] = parsedData.map((row, index) => ({
        rowNumber: index + 1,
        distributorId: row.distributor_id || '',
        endCustomerId: row.end_customer_id || '',
        productIsbn: row.product_isbn || '',
        quantity: parseInt(row.quantity || '0', 10),
        transactionType: (row.transaction_type || 'sale').toLowerCase() as TransactionType,
        contractNumber: row.contract_number,
        poNumber: row.po_number,
        caseId: row.case_id,
        notes: row.notes,
      }));

      const job = createBatchJob(file.name, records);
      setActiveJob(job);
    } catch {
      setUploadError('Failed to parse CSV file. Please check the format.');
    }
  };

  const handleStartProcessing = () => {
    if (activeJob) {
      processBatch(activeJob);
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        distributor_id: 'dist-1',
        end_customer_id: 'cust-1',
        product_isbn: '978-1-2345-6789-0',
        quantity: '100',
        transaction_type: 'sale',
        contract_number: 'CON-2024-001',
        po_number: 'PO-XXX-2024-001',
        case_id: '',
        notes: 'Example transfer',
      },
    ];
    downloadCSV(templateData, 'license_transfer_template.csv');
  };

  const handleDownloadErrors = () => {
    if (!activeJob) return;

    const errorRows = activeJob.results
      .filter(r => !r.isValid)
      .map(r => ({
        row_number: r.rowNumber,
        errors: r.errors.join('; '),
        warnings: r.warnings.join('; '),
      }));

    downloadCSV(errorRows, `${activeJob.fileName.replace('.csv', '')}_errors.csv`);
  };

  const progressPercent = activeJob && activeJob.status === 'processing'
    ? Math.round((activeJob.processedRecords / activeJob.validRecords) * 100)
    : activeJob?.status === 'completed'
    ? 100
    : 0;

  if (!canUploadBatches) {
    return (
      <Layout title="Batch Upload" subtitle="Process multiple license transfers via CSV">
        <Alert variant="warning" title="Access Restricted">
          You do not have permission to upload batch files. Please contact an administrator.
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout title="Batch Upload" subtitle="Process multiple license transfers via CSV file">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload CSV File</CardTitle>
                <CardDescription>
                  Upload a CSV file containing license transfer records. The file will be validated before processing.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {uploadError && (
                  <Alert variant="error" className="mb-4" onDismiss={() => setUploadError('')}>
                    {uploadError}
                  </Alert>
                )}

                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">
                    Drag and drop your CSV file here, or
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-500 mt-4">
                    Supported format: CSV with headers
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleDownloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </CardFooter>
            </Card>

            {activeJob && (
              <Card className="mt-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {activeJob.fileName}
                    </CardTitle>
                    <CardDescription>
                      Uploaded {formatDateTime(activeJob.uploadedAt)}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      activeJob.status === 'completed'
                        ? 'success'
                        : activeJob.status === 'failed'
                        ? 'error'
                        : activeJob.status === 'processing'
                        ? 'info'
                        : 'warning'
                    }
                  >
                    {activeJob.status.charAt(0).toUpperCase() + activeJob.status.slice(1)}
                  </Badge>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{activeJob.totalRecords}</p>
                      <p className="text-sm text-gray-500">Total Records</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{activeJob.validRecords}</p>
                      <p className="text-sm text-gray-500">Valid</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{activeJob.invalidRecords}</p>
                      <p className="text-sm text-gray-500">Invalid</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{activeJob.processedRecords}</p>
                      <p className="text-sm text-gray-500">Processed</p>
                    </div>
                  </div>

                  {(activeJob.status === 'processing' || activeJob.status === 'completed') && (
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{progressPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {activeJob.results.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="max-h-64 overflow-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-16">Row</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Details</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {activeJob.results.slice(0, 20).map((result) => (
                              <TableRow key={result.rowNumber}>
                                <TableCell className="font-medium">{result.rowNumber}</TableCell>
                                <TableCell>
                                  {result.isValid ? (
                                    <div className="flex items-center gap-1 text-green-600">
                                      <CheckCircle2 className="h-4 w-4" />
                                      <span className="text-sm">Valid</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 text-red-600">
                                      <XCircle className="h-4 w-4" />
                                      <span className="text-sm">Invalid</span>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {result.errors.length > 0 && (
                                    <p className="text-sm text-red-600">{result.errors.join(', ')}</p>
                                  )}
                                  {result.warnings.length > 0 && (
                                    <p className="text-sm text-yellow-600 flex items-center gap-1">
                                      <AlertTriangle className="h-3 w-3" />
                                      {result.warnings.join(', ')}
                                    </p>
                                  )}
                                  {result.isValid && result.errors.length === 0 && result.warnings.length === 0 && (
                                    <span className="text-sm text-gray-500">Ready to process</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {activeJob.results.length > 20 && (
                        <div className="px-4 py-2 bg-gray-50 text-sm text-gray-500 text-center">
                          Showing 20 of {activeJob.results.length} records
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex justify-between">
                  {activeJob.invalidRecords > 0 && (
                    <Button variant="outline" onClick={handleDownloadErrors}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Errors
                    </Button>
                  )}
                  <div className="ml-auto flex gap-3">
                    {activeJob.status === 'validated' && activeJob.validRecords > 0 && (
                      <Button onClick={handleStartProcessing}>
                        <Play className="h-4 w-4 mr-2" />
                        Process {activeJob.validRecords} Valid Records
                      </Button>
                    )}
                    {activeJob.status === 'processing' && (
                      <Button disabled>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </Button>
                    )}
                    {activeJob.status === 'completed' && (
                      <Button variant="secondary" onClick={() => setActiveJob(null)}>
                        Upload New File
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>CSV Format</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-gray-600 mb-4">Required columns:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Badge variant="info" className="mt-0.5">Required</Badge>
                    <div>
                      <code className="text-xs bg-gray-100 px-1 rounded">distributor_id</code>
                      <p className="text-gray-500 text-xs mt-0.5">Distributor account ID or code</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="info" className="mt-0.5">Required</Badge>
                    <div>
                      <code className="text-xs bg-gray-100 px-1 rounded">end_customer_id</code>
                      <p className="text-gray-500 text-xs mt-0.5">End customer ID or school code</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="info" className="mt-0.5">Required</Badge>
                    <div>
                      <code className="text-xs bg-gray-100 px-1 rounded">product_isbn</code>
                      <p className="text-gray-500 text-xs mt-0.5">Product ISBN</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="info" className="mt-0.5">Required</Badge>
                    <div>
                      <code className="text-xs bg-gray-100 px-1 rounded">quantity</code>
                      <p className="text-gray-500 text-xs mt-0.5">Number of licenses</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="info" className="mt-0.5">Required</Badge>
                    <div>
                      <code className="text-xs bg-gray-100 px-1 rounded">transaction_type</code>
                      <p className="text-gray-500 text-xs mt-0.5">sale, cancellation, or extension</p>
                    </div>
                  </li>
                </ul>
                <p className="text-gray-600 mt-4 mb-2">Optional columns:</p>
                <ul className="space-y-1 text-gray-500 text-xs">
                  <li><code className="bg-gray-100 px-1 rounded">contract_number</code></li>
                  <li><code className="bg-gray-100 px-1 rounded">po_number</code></li>
                  <li><code className="bg-gray-100 px-1 rounded">case_id</code></li>
                  <li><code className="bg-gray-100 px-1 rounded">notes</code></li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Batch Jobs</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {batchJobs.length === 0 ? (
                  <p className="px-6 py-4 text-sm text-gray-500">No batch jobs yet</p>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {batchJobs.slice(0, 5).map((job) => (
                      <div
                        key={job.id}
                        className="px-6 py-3 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setActiveJob(job)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {job.fileName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {job.processedRecords}/{job.totalRecords} processed
                            </p>
                          </div>
                          <Badge
                            variant={
                              job.status === 'completed'
                                ? 'success'
                                : job.status === 'failed'
                                ? 'error'
                                : 'warning'
                            }
                          >
                            {job.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
