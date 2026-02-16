import { useState } from 'react';
import {
  User,
  Bell,
  Shield,
  Database,
  Globe,
  Save,
  RefreshCw,
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
  Input,
  Select,
  Badge,
  Alert,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { mockUsers } from '../data/mockData';
import type { UserRole } from '../types';

export default function SettingsPage() {
  const { user, login } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState(user?.id || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [notifications, setNotifications] = useState({
    transferComplete: true,
    batchComplete: true,
    transferFailed: true,
    lowInventory: false,
  });

  const handleSwitchUser = () => {
    const selectedUser = mockUsers.find(u => u.id === selectedUserId);
    if (selectedUser) {
      login(selectedUser.email);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const roleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>;
      case 'operator':
        return <Badge className="bg-blue-100 text-blue-800">Operator</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Viewer</Badge>;
    }
  };

  return (
    <Layout title="Settings" subtitle="Manage your account and application preferences">
      <div className="max-w-4xl space-y-6">
        {saveSuccess && (
          <Alert variant="success" title="Settings Saved" onDismiss={() => setSaveSuccess(false)}>
            Your settings have been updated successfully.
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <User className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={user?.name || ''}
                disabled
                helperText="Contact an administrator to change your name"
              />
              <Input
                label="Email Address"
                type="email"
                value={user?.email || ''}
                disabled
                helperText="Email cannot be changed"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <span className="text-sm text-gray-500">Current Role:</span>
              {user && roleBadge(user.role)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <RefreshCw className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <CardTitle>Demo: Switch User Role</CardTitle>
                <CardDescription>For testing purposes - switch between different user roles</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="info">
              This is a demo feature. In production, users would authenticate via SSO.
            </Alert>
            <Select
              label="Select User"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              options={mockUsers.map(u => ({
                value: u.id,
                label: `${u.name} (${u.role})`,
              }))}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSwitchUser}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Switch User
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { key: 'transferComplete', label: 'Transfer completed successfully' },
                { key: 'batchComplete', label: 'Batch processing completed' },
                { key: 'transferFailed', label: 'Transfer failed or rolled back' },
                { key: 'lowInventory', label: 'Low distributor inventory warning' },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setNotifications({
                        ...notifications,
                        [item.key]: !notifications[item.key as keyof typeof notifications],
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications[item.key as keyof typeof notifications]
                        ? 'bg-primary-600'
                        : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications[item.key as keyof typeof notifications]
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={() => setSaveSuccess(true)}>
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Database className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Application and database connection status</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Application Version</p>
                  <p className="font-medium text-gray-900">1.0.0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Environment</p>
                  <Badge variant="warning">Development</Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Service Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm text-gray-700">Roses Database</span>
                    </div>
                    <Badge variant="success">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm text-gray-700">Authentication Service</span>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm text-gray-700">Batch Processing Queue</span>
                    </div>
                    <Badge variant="success">Ready</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Globe className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <CardTitle>Regional Settings</CardTitle>
                <CardDescription>Configure regional and display preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Timezone"
                value="America/New_York"
                options={[
                  { value: 'America/New_York', label: 'Eastern Time (ET)' },
                  { value: 'America/Chicago', label: 'Central Time (CT)' },
                  { value: 'America/Denver', label: 'Mountain Time (MT)' },
                  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
                  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
                  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
                ]}
                onChange={() => {}}
              />
              <Select
                label="Date Format"
                value="MM/DD/YYYY"
                options={[
                  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                ]}
                onChange={() => {}}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={() => setSaveSuccess(true)}>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage security settings and session</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Last Login</p>
                <p className="font-medium text-gray-900">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Session Timeout</p>
                <p className="font-medium text-gray-900">30 minutes of inactivity</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Authentication Method</p>
                <p className="font-medium text-gray-900">SSO (Single Sign-On)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
