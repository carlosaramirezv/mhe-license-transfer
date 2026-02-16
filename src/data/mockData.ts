import type {
  User,
  DistributorAccount,
  EndCustomerAccount,
  Product,
  License,
  AuditRecord,
  BatchJob,
} from '../types';

export const mockUsers: User[] = [
  { id: 'user-1', email: 'admin@mheducation.com', name: 'Sarah Admin', role: 'admin', lastLogin: new Date('2024-12-01') },
  { id: 'user-2', email: 'operator1@mheducation.com', name: 'John Operator', role: 'operator', lastLogin: new Date('2024-12-03') },
  { id: 'user-3', email: 'operator2@mheducation.com', name: 'Emily Operator', role: 'operator', lastLogin: new Date('2024-12-02') },
  { id: 'user-4', email: 'viewer@mheducation.com', name: 'Mike Viewer', role: 'viewer', lastLogin: new Date('2024-11-28') },
];

export const mockDistributors: DistributorAccount[] = [
  { id: 'dist-1', name: 'EduBooks Europe GmbH', code: 'EBE-001', region: 'EMEA', status: 'active', createdAt: new Date('2022-03-15') },
  { id: 'dist-2', name: 'Asia Pacific Learning', code: 'APL-002', region: 'APAC', status: 'active', createdAt: new Date('2021-08-22') },
  { id: 'dist-3', name: 'LatAm Educational Partners', code: 'LEP-003', region: 'LATAM', status: 'active', createdAt: new Date('2023-01-10') },
  { id: 'dist-4', name: 'Nordic Education Solutions', code: 'NES-004', region: 'EMEA', status: 'active', createdAt: new Date('2022-11-05') },
  { id: 'dist-5', name: 'Middle East Learning Hub', code: 'MEL-005', region: 'MEA', status: 'inactive', createdAt: new Date('2020-06-18') },
];

export const mockEndCustomers: EndCustomerAccount[] = [
  { id: 'cust-1', name: 'Berlin International School', distributorId: 'dist-1', schoolCode: 'BIS-DE-001', address: 'Berlin, Germany', contactEmail: 'admin@bis.edu', status: 'active', createdAt: new Date('2023-06-01') },
  { id: 'cust-2', name: 'Paris Academy of Sciences', distributorId: 'dist-1', schoolCode: 'PAS-FR-002', address: 'Paris, France', contactEmail: 'tech@pas.edu', status: 'active', createdAt: new Date('2023-08-15') },
  { id: 'cust-3', name: 'Tokyo Tech High School', distributorId: 'dist-2', schoolCode: 'TTH-JP-001', address: 'Tokyo, Japan', contactEmail: 'it@tth.ac.jp', status: 'active', createdAt: new Date('2023-04-20') },
  { id: 'cust-4', name: 'Singapore Learning Center', distributorId: 'dist-2', schoolCode: 'SLC-SG-002', address: 'Singapore', contactEmail: 'admin@slc.edu.sg', status: 'active', createdAt: new Date('2023-09-01') },
  { id: 'cust-5', name: 'Sao Paulo Business School', distributorId: 'dist-3', schoolCode: 'SPBS-BR-001', address: 'Sao Paulo, Brazil', contactEmail: 'support@spbs.edu.br', status: 'active', createdAt: new Date('2023-07-10') },
  { id: 'cust-6', name: 'Mexico City Institute', distributorId: 'dist-3', schoolCode: 'MCI-MX-002', address: 'Mexico City, Mexico', contactEmail: 'admin@mci.edu.mx', status: 'active', createdAt: new Date('2024-01-15') },
  { id: 'cust-7', name: 'Stockholm Grammar School', distributorId: 'dist-4', schoolCode: 'SGS-SE-001', address: 'Stockholm, Sweden', contactEmail: 'it@sgs.se', status: 'active', createdAt: new Date('2023-10-01') },
  { id: 'cust-8', name: 'Oslo Technical College', distributorId: 'dist-4', schoolCode: 'OTC-NO-002', address: 'Oslo, Norway', contactEmail: 'tech@otc.no', status: 'active', createdAt: new Date('2023-11-20') },
  { id: 'cust-9', name: 'Copenhagen Business Academy', distributorId: 'dist-4', schoolCode: 'CBA-DK-003', address: 'Copenhagen, Denmark', contactEmail: 'admin@cba.dk', status: 'inactive', createdAt: new Date('2022-05-10') },
];

export const mockProducts: Product[] = [
  { id: 'prod-1', isbn: '978-1-2345-6789-0', title: 'Connect Math Pro', type: 'subscription', defaultTermMonths: 12 },
  { id: 'prod-2', isbn: '978-1-2345-6789-1', title: 'ALEKS Chemistry', type: 'subscription', defaultTermMonths: 12 },
  { id: 'prod-3', isbn: '978-1-2345-6789-2', title: 'SmartBook Biology', type: 'digital', defaultTermMonths: 24 },
  { id: 'prod-4', isbn: '978-1-2345-6789-3', title: 'Connect Writing', type: 'subscription', defaultTermMonths: 12 },
  { id: 'prod-5', isbn: '978-1-2345-6789-4', title: 'McGraw-Hill eBook Physics', type: 'digital', defaultTermMonths: 36 },
  { id: 'prod-6', isbn: '978-1-2345-6789-5', title: 'ALEKS Math', type: 'subscription', defaultTermMonths: 12 },
  { id: 'prod-7', isbn: '978-1-2345-6789-6', title: 'Connect Economics', type: 'subscription', defaultTermMonths: 12 },
  { id: 'prod-8', isbn: '978-1-2345-6789-7', title: 'SmartBook Psychology', type: 'digital', defaultTermMonths: 24 },
];

export const mockDistributorLicenses: License[] = [
  { id: 'lic-d1-1', productId: 'prod-1', accountId: 'dist-1', accountType: 'distributor', quantity: 5000, quantityUsed: 1250, startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31'), status: 'active' },
  { id: 'lic-d1-2', productId: 'prod-2', accountId: 'dist-1', accountType: 'distributor', quantity: 3000, quantityUsed: 800, startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31'), status: 'active' },
  { id: 'lic-d1-3', productId: 'prod-3', accountId: 'dist-1', accountType: 'distributor', quantity: 2000, quantityUsed: 600, startDate: new Date('2024-01-01'), endDate: new Date('2025-12-31'), status: 'active' },
  { id: 'lic-d2-1', productId: 'prod-1', accountId: 'dist-2', accountType: 'distributor', quantity: 8000, quantityUsed: 3500, startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31'), status: 'active' },
  { id: 'lic-d2-2', productId: 'prod-6', accountId: 'dist-2', accountType: 'distributor', quantity: 4000, quantityUsed: 1800, startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31'), status: 'active' },
  { id: 'lic-d3-1', productId: 'prod-4', accountId: 'dist-3', accountType: 'distributor', quantity: 2500, quantityUsed: 900, startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31'), status: 'active' },
  { id: 'lic-d3-2', productId: 'prod-7', accountId: 'dist-3', accountType: 'distributor', quantity: 1500, quantityUsed: 450, startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31'), status: 'active' },
  { id: 'lic-d4-1', productId: 'prod-1', accountId: 'dist-4', accountType: 'distributor', quantity: 3500, quantityUsed: 1200, startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31'), status: 'active' },
  { id: 'lic-d4-2', productId: 'prod-5', accountId: 'dist-4', accountType: 'distributor', quantity: 1000, quantityUsed: 350, startDate: new Date('2024-01-01'), endDate: new Date('2026-12-31'), status: 'active' },
  { id: 'lic-d4-3', productId: 'prod-8', accountId: 'dist-4', accountType: 'distributor', quantity: 2000, quantityUsed: 700, startDate: new Date('2024-01-01'), endDate: new Date('2025-12-31'), status: 'active' },
];

export const mockEndCustomerLicenses: License[] = [
  { id: 'lic-c1-1', productId: 'prod-1', accountId: 'cust-1', accountType: 'end_customer', quantity: 500, quantityUsed: 320, startDate: new Date('2024-02-01'), endDate: new Date('2025-01-31'), status: 'active' },
  { id: 'lic-c1-2', productId: 'prod-2', accountId: 'cust-1', accountType: 'end_customer', quantity: 300, quantityUsed: 180, startDate: new Date('2024-03-01'), endDate: new Date('2025-02-28'), status: 'active' },
  { id: 'lic-c2-1', productId: 'prod-1', accountId: 'cust-2', accountType: 'end_customer', quantity: 750, quantityUsed: 600, startDate: new Date('2024-01-15'), endDate: new Date('2025-01-14'), status: 'active' },
  { id: 'lic-c2-2', productId: 'prod-3', accountId: 'cust-2', accountType: 'end_customer', quantity: 400, quantityUsed: 280, startDate: new Date('2024-02-01'), endDate: new Date('2026-01-31'), status: 'active' },
  { id: 'lic-c3-1', productId: 'prod-1', accountId: 'cust-3', accountType: 'end_customer', quantity: 1200, quantityUsed: 950, startDate: new Date('2024-04-01'), endDate: new Date('2025-03-31'), status: 'active' },
  { id: 'lic-c3-2', productId: 'prod-6', accountId: 'cust-3', accountType: 'end_customer', quantity: 800, quantityUsed: 620, startDate: new Date('2024-04-01'), endDate: new Date('2025-03-31'), status: 'active' },
  { id: 'lic-c4-1', productId: 'prod-1', accountId: 'cust-4', accountType: 'end_customer', quantity: 600, quantityUsed: 400, startDate: new Date('2024-05-01'), endDate: new Date('2025-04-30'), status: 'active' },
  { id: 'lic-c5-1', productId: 'prod-4', accountId: 'cust-5', accountType: 'end_customer', quantity: 450, quantityUsed: 300, startDate: new Date('2024-06-01'), endDate: new Date('2025-05-31'), status: 'active' },
  { id: 'lic-c6-1', productId: 'prod-4', accountId: 'cust-6', accountType: 'end_customer', quantity: 350, quantityUsed: 200, startDate: new Date('2024-07-01'), endDate: new Date('2025-06-30'), status: 'active' },
  { id: 'lic-c7-1', productId: 'prod-1', accountId: 'cust-7', accountType: 'end_customer', quantity: 550, quantityUsed: 400, startDate: new Date('2024-08-01'), endDate: new Date('2025-07-31'), status: 'active' },
  { id: 'lic-c7-2', productId: 'prod-5', accountId: 'cust-7', accountType: 'end_customer', quantity: 200, quantityUsed: 150, startDate: new Date('2024-08-01'), endDate: new Date('2027-07-31'), status: 'active' },
  { id: 'lic-c8-1', productId: 'prod-1', accountId: 'cust-8', accountType: 'end_customer', quantity: 400, quantityUsed: 280, startDate: new Date('2024-09-01'), endDate: new Date('2025-08-31'), status: 'active' },
  { id: 'lic-c8-2', productId: 'prod-8', accountId: 'cust-8', accountType: 'end_customer', quantity: 350, quantityUsed: 200, startDate: new Date('2024-09-01'), endDate: new Date('2026-08-31'), status: 'active' },
];

export const mockAuditRecords: AuditRecord[] = [
  {
    id: 'audit-1',
    timestamp: new Date('2024-11-28T09:15:00'),
    userId: 'user-2',
    userName: 'John Operator',
    distributorId: 'dist-1',
    distributorName: 'EduBooks Europe GmbH',
    endCustomerId: 'cust-1',
    endCustomerName: 'Berlin International School',
    productId: 'prod-1',
    productIsbn: '978-1-2345-6789-0',
    productTitle: 'Connect Math Pro',
    transactionType: 'sale',
    quantityBefore: 200,
    quantityAfter: 500,
    distributorQuantityBefore: 3550,
    distributorQuantityAfter: 3250,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2025-01-31'),
    status: 'applied',
    contractNumber: 'CON-2024-001',
    poNumber: 'PO-BIS-2024-042',
    notes: 'Annual license renewal with quantity increase'
  },
  {
    id: 'audit-2',
    timestamp: new Date('2024-11-27T14:30:00'),
    userId: 'user-3',
    userName: 'Emily Operator',
    distributorId: 'dist-2',
    distributorName: 'Asia Pacific Learning',
    endCustomerId: 'cust-3',
    endCustomerName: 'Tokyo Tech High School',
    productId: 'prod-6',
    productIsbn: '978-1-2345-6789-5',
    productTitle: 'ALEKS Math',
    transactionType: 'sale',
    quantityBefore: 500,
    quantityAfter: 800,
    distributorQuantityBefore: 2100,
    distributorQuantityAfter: 1800,
    startDate: new Date('2024-04-01'),
    endDate: new Date('2025-03-31'),
    status: 'applied',
    contractNumber: 'CON-2024-015',
    poNumber: 'PO-TTH-2024-089'
  },
  {
    id: 'audit-3',
    timestamp: new Date('2024-11-26T10:45:00'),
    userId: 'user-2',
    userName: 'John Operator',
    distributorId: 'dist-4',
    distributorName: 'Nordic Education Solutions',
    endCustomerId: 'cust-7',
    endCustomerName: 'Stockholm Grammar School',
    productId: 'prod-5',
    productIsbn: '978-1-2345-6789-4',
    productTitle: 'McGraw-Hill eBook Physics',
    transactionType: 'extension',
    quantityBefore: 200,
    quantityAfter: 200,
    distributorQuantityBefore: 350,
    distributorQuantityAfter: 350,
    startDate: new Date('2024-08-01'),
    endDate: new Date('2027-07-31'),
    status: 'applied',
    caseId: 'CASE-2024-1122',
    notes: 'Extended license term by 12 months per customer request'
  },
  {
    id: 'audit-4',
    timestamp: new Date('2024-11-25T16:20:00'),
    userId: 'user-3',
    userName: 'Emily Operator',
    distributorId: 'dist-3',
    distributorName: 'LatAm Educational Partners',
    endCustomerId: 'cust-5',
    endCustomerName: 'Sao Paulo Business School',
    productId: 'prod-7',
    productIsbn: '978-1-2345-6789-6',
    productTitle: 'Connect Economics',
    transactionType: 'cancellation',
    quantityBefore: 200,
    quantityAfter: 100,
    distributorQuantityBefore: 350,
    distributorQuantityAfter: 450,
    status: 'applied',
    contractNumber: 'CON-2024-008',
    notes: 'Partial cancellation due to program restructuring'
  },
  {
    id: 'audit-5',
    timestamp: new Date('2024-11-24T11:00:00'),
    userId: 'user-2',
    userName: 'John Operator',
    distributorId: 'dist-1',
    distributorName: 'EduBooks Europe GmbH',
    endCustomerId: 'cust-2',
    endCustomerName: 'Paris Academy of Sciences',
    productId: 'prod-3',
    productIsbn: '978-1-2345-6789-2',
    productTitle: 'SmartBook Biology',
    transactionType: 'sale',
    quantityBefore: 0,
    quantityAfter: 400,
    distributorQuantityBefore: 1000,
    distributorQuantityAfter: 600,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2026-01-31'),
    status: 'applied',
    contractNumber: 'CON-2024-022',
    poNumber: 'PO-PAS-2024-015'
  },
  {
    id: 'audit-6',
    timestamp: new Date('2024-11-23T09:30:00'),
    userId: 'user-2',
    userName: 'John Operator',
    distributorId: 'dist-2',
    distributorName: 'Asia Pacific Learning',
    endCustomerId: 'cust-4',
    endCustomerName: 'Singapore Learning Center',
    productId: 'prod-1',
    productIsbn: '978-1-2345-6789-0',
    productTitle: 'Connect Math Pro',
    transactionType: 'sale',
    quantityBefore: 400,
    quantityAfter: 600,
    distributorQuantityBefore: 3700,
    distributorQuantityAfter: 3500,
    status: 'failed',
    errorDetails: 'Database connection timeout - transaction rolled back',
    contractNumber: 'CON-2024-030'
  },
  {
    id: 'audit-7',
    timestamp: new Date('2024-11-22T15:45:00'),
    userId: 'user-3',
    userName: 'Emily Operator',
    distributorId: 'dist-4',
    distributorName: 'Nordic Education Solutions',
    endCustomerId: 'cust-8',
    endCustomerName: 'Oslo Technical College',
    productId: 'prod-8',
    productIsbn: '978-1-2345-6789-7',
    productTitle: 'SmartBook Psychology',
    transactionType: 'sale',
    quantityBefore: 0,
    quantityAfter: 350,
    distributorQuantityBefore: 1050,
    distributorQuantityAfter: 700,
    startDate: new Date('2024-09-01'),
    endDate: new Date('2026-08-31'),
    status: 'applied',
    contractNumber: 'CON-2024-035',
    poNumber: 'PO-OTC-2024-007'
  },
  {
    id: 'audit-8',
    timestamp: new Date('2024-11-21T13:15:00'),
    userId: 'user-2',
    userName: 'John Operator',
    distributorId: 'dist-3',
    distributorName: 'LatAm Educational Partners',
    endCustomerId: 'cust-6',
    endCustomerName: 'Mexico City Institute',
    productId: 'prod-4',
    productIsbn: '978-1-2345-6789-3',
    productTitle: 'Connect Writing',
    transactionType: 'sale',
    quantityBefore: 200,
    quantityAfter: 350,
    distributorQuantityBefore: 1050,
    distributorQuantityAfter: 900,
    startDate: new Date('2024-07-01'),
    endDate: new Date('2025-06-30'),
    status: 'applied',
    contractNumber: 'CON-2024-028',
    poNumber: 'PO-MCI-2024-023'
  },
  {
    id: 'audit-9',
    timestamp: new Date('2024-11-20T10:00:00'),
    userId: 'user-3',
    userName: 'Emily Operator',
    distributorId: 'dist-1',
    distributorName: 'EduBooks Europe GmbH',
    endCustomerId: 'cust-1',
    endCustomerName: 'Berlin International School',
    productId: 'prod-2',
    productIsbn: '978-1-2345-6789-1',
    productTitle: 'ALEKS Chemistry',
    transactionType: 'extension',
    quantityBefore: 300,
    quantityAfter: 300,
    distributorQuantityBefore: 800,
    distributorQuantityAfter: 800,
    startDate: new Date('2024-03-01'),
    endDate: new Date('2025-02-28'),
    status: 'applied',
    caseId: 'CASE-2024-0998'
  },
  {
    id: 'audit-10',
    timestamp: new Date('2024-11-19T14:30:00'),
    userId: 'user-2',
    userName: 'John Operator',
    distributorId: 'dist-2',
    distributorName: 'Asia Pacific Learning',
    endCustomerId: 'cust-3',
    endCustomerName: 'Tokyo Tech High School',
    productId: 'prod-1',
    productIsbn: '978-1-2345-6789-0',
    productTitle: 'Connect Math Pro',
    transactionType: 'sale',
    quantityBefore: 800,
    quantityAfter: 1200,
    distributorQuantityBefore: 3900,
    distributorQuantityAfter: 3500,
    startDate: new Date('2024-04-01'),
    endDate: new Date('2025-03-31'),
    status: 'applied',
    contractNumber: 'CON-2024-018',
    poNumber: 'PO-TTH-2024-056'
  },
];

export const mockBatchJobs: BatchJob[] = [
  {
    id: 'batch-1',
    fileName: 'q4_license_transfers.csv',
    uploadedAt: new Date('2024-11-15T09:00:00'),
    uploadedBy: 'John Operator',
    totalRecords: 45,
    validRecords: 43,
    invalidRecords: 2,
    processedRecords: 43,
    status: 'completed',
    results: [],
    completedAt: new Date('2024-11-15T09:05:32')
  },
  {
    id: 'batch-2',
    fileName: 'emea_renewals_november.csv',
    uploadedAt: new Date('2024-11-20T14:30:00'),
    uploadedBy: 'Emily Operator',
    totalRecords: 28,
    validRecords: 28,
    invalidRecords: 0,
    processedRecords: 28,
    status: 'completed',
    results: [],
    completedAt: new Date('2024-11-20T14:33:15')
  },
];

export function getDistributorById(id: string): DistributorAccount | undefined {
  return mockDistributors.find(d => d.id === id);
}

export function getEndCustomerById(id: string): EndCustomerAccount | undefined {
  return mockEndCustomers.find(c => c.id === id);
}

export function getProductById(id: string): Product | undefined {
  return mockProducts.find(p => p.id === id);
}

export function getProductByIsbn(isbn: string): Product | undefined {
  return mockProducts.find(p => p.isbn === isbn);
}

export function getEndCustomersByDistributor(distributorId: string): EndCustomerAccount[] {
  return mockEndCustomers.filter(c => c.distributorId === distributorId);
}

export function getDistributorLicenses(distributorId: string): License[] {
  return mockDistributorLicenses.filter(l => l.accountId === distributorId);
}

export function getEndCustomerLicenses(customerId: string): License[] {
  return mockEndCustomerLicenses.filter(l => l.accountId === customerId);
}

export function getLicenseForAccountAndProduct(accountId: string, productId: string, accountType: 'distributor' | 'end_customer'): License | undefined {
  const licenses = accountType === 'distributor' ? mockDistributorLicenses : mockEndCustomerLicenses;
  return licenses.find(l => l.accountId === accountId && l.productId === productId && l.status === 'active');
}
