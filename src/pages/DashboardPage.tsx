import { useNavigate } from 'react-router-dom';
import {
  ArrowRightLeft,
  FileUp,
  History,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useTransfer } from '../context/TransferContext';
import { formatDateTime } from '../lib/utils';
import { mockDistributors, mockEndCustomers, mockProducts } from '../data/mockData';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { canPerformTransfers, canUploadBatches } = useAuth();
  const { auditRecords, batchJobs } = useTransfer();

  const recentTransfers = auditRecords.slice(0, 5);
  const recentBatches = batchJobs.slice(0, 3);

  const totalTransfersThisMonth = auditRecords.filter(
    r => new Date(r.timestamp).getMonth() === new Date().getMonth()
  ).length;

  const successfulTransfers = auditRecords.filter(r => r.status === 'applied').length;
  const failedTransfers = auditRecords.filter(r => r.status === 'failed').length;
  const successRate = auditRecords.length > 0
    ? Math.round((successfulTransfers / auditRecords.length) * 100)
    : 100;

  const stats = [
    {
      label: 'Total Transfers This Month',
      value: totalTransfersThisMonth,
      icon: ArrowRightLeft,
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Active Distributors',
      value: mockDistributors.filter(d => d.status === 'active').length,
      icon: TrendingUp,
      trend: 'Stable',
      trendUp: true,
    },
    {
      label: 'Active End Customers',
      value: mockEndCustomers.filter(c => c.status === 'active').length,
      icon: TrendingUp,
      trend: '+5%',
      trendUp: true,
    },
    {
      label: 'Success Rate',
      value: `${successRate}%`,
      icon: successRate >= 95 ? TrendingUp : TrendingDown,
      trend: successRate >= 95 ? 'Excellent' : 'Needs attention',
      trendUp: successRate >= 95,
    },
  ];

  const statusBadge = (status: string) => {
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

  const transactionTypeBadge = (type: string) => {
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

  return (
    <Layout title="Dashboard" subtitle="License Transfer Management Overview">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.trendUp ? 'bg-green-100' : 'bg-red-100'}`}>
                    <stat.icon className={`h-6 w-6 ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                </div>
                <p className={`text-sm mt-2 ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-4">
          {canPerformTransfers && (
            <Button onClick={() => navigate('/transfer')} className="gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              New Transfer
            </Button>
          )}
          {canUploadBatches && (
            <Button onClick={() => navigate('/batch')} variant="secondary" className="gap-2">
              <FileUp className="h-4 w-4" />
              Batch Upload
            </Button>
          )}
          <Button onClick={() => navigate('/audit')} variant="outline" className="gap-2">
            <History className="h-4 w-4" />
            View Audit Log
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Transfers</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/audit')}>
                View All
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {recentTransfers.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No transfers yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recentTransfers.map((transfer) => (
                    <div key={transfer.id} className="px-6 py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {transactionTypeBadge(transfer.transactionType)}
                            {statusBadge(transfer.status)}
                          </div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {transfer.productTitle}
                          </p>
                          <p className="text-sm text-gray-500">
                            {transfer.distributorName} → {transfer.endCustomerName}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDateTime(transfer.timestamp)} by {transfer.userName}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {transfer.transactionType === 'cancellation' ? '-' : '+'}
                            {Math.abs(transfer.quantityAfter - transfer.quantityBefore)} licenses
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Batch Jobs</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/batch')}>
                View All
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {recentBatches.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  <FileUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No batch jobs yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recentBatches.map((batch) => (
                    <div key={batch.id} className="px-6 py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {batch.status === 'completed' ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : batch.status === 'failed' ? (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-600" />
                            )}
                            <Badge
                              variant={
                                batch.status === 'completed'
                                  ? 'success'
                                  : batch.status === 'failed'
                                  ? 'error'
                                  : 'warning'
                              }
                            >
                              {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {batch.fileName}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDateTime(batch.uploadedAt)} by {batch.uploadedBy}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {batch.processedRecords}/{batch.totalRecords}
                          </p>
                          <p className="text-xs text-gray-500">records</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total Products</span>
                  <span className="text-sm font-medium text-gray-900">{mockProducts.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Successful Transfers</span>
                  <span className="text-sm font-medium text-green-600">{successfulTransfers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Failed Transfers</span>
                  <span className="text-sm font-medium text-red-600">{failedTransfers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Batch Jobs</span>
                  <span className="text-sm font-medium text-gray-900">{batchJobs.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-gray-700">Roses Database Connection</span>
                  <Badge variant="success" className="ml-auto">Healthy</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-gray-700">IAT Authentication Service</span>
                  <Badge variant="success" className="ml-auto">Healthy</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-gray-700">Batch Processing Queue</span>
                  <Badge variant="success" className="ml-auto">Healthy</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-gray-700">Audit Log Service</span>
                  <Badge variant="success" className="ml-auto">Healthy</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
