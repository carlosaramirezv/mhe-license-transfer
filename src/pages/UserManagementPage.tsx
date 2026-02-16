import { useState } from 'react';
import {
  UserPlus,
  Edit2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Clock,
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Alert,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { mockUsers } from '../data/mockData';
import { formatDateTime } from '../lib/utils';
import type { User, UserRole } from '../types';

export default function UserManagementPage() {
  const { canManageUsers, user: currentUser } = useAuth();
  const [users] = useState<User[]>(mockUsers);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'viewer' as UserRole,
  });

  const filteredUsers = users.filter(
    u =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <ShieldAlert className="h-4 w-4 text-purple-600" />;
      case 'operator':
        return <ShieldCheck className="h-4 w-4 text-blue-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-400" />;
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

  const handleOpenAddDialog = () => {
    setFormData({ name: '', email: '', role: 'viewer' });
    setShowAddDialog(true);
  };

  const handleEditUser = (user: User) => {
    setFormData({ name: user.name, email: user.email, role: user.role });
    setEditingUser(user);
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'viewer' });
  };

  if (!canManageUsers) {
    return (
      <Layout title="User Management" subtitle="Manage user accounts and permissions">
        <Alert variant="warning" title="Access Restricted">
          You do not have permission to manage users. Please contact an administrator.
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout title="User Management" subtitle="Manage user accounts and permissions">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ShieldAlert className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                  <p className="text-sm text-gray-500">Administrators</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ShieldCheck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.role === 'operator').length}
                  </p>
                  <p className="text-sm text-gray-500">Operators</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Shield className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.role === 'viewer').length}
                  </p>
                  <p className="text-sm text-gray-500">Viewers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage user accounts and their permissions</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="search"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 h-9"
              />
              <Button onClick={handleOpenAddDialog}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {roleIcon(user.role)}
                        {roleBadge(user.role)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.lastLogin ? (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(user.lastLogin)}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        disabled={user.id === currentUser?.id}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>Overview of permissions for each role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <h4 className="font-medium text-gray-900">Viewer</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    View dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    View audit log
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    Perform transfers
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    Upload batch files
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    Export audit log
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    Manage users
                  </li>
                </ul>
              </div>

              <div className="border rounded-lg p-4 border-blue-200 bg-blue-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-gray-900">Operator</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    View dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    View audit log
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Perform transfers
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Upload batch files
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Export audit log
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    Manage users
                  </li>
                </ul>
              </div>

              <div className="border rounded-lg p-4 border-purple-200 bg-purple-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldAlert className="h-5 w-5 text-purple-600" />
                  <h4 className="font-medium text-gray-900">Administrator</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    View dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    View audit log
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Perform transfers
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Upload batch files
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Export audit log
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Manage users
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={showAddDialog || !!editingUser}
        onClose={handleCloseDialog}
        className="w-full max-w-md"
      >
        <DialogHeader onClose={handleCloseDialog}>
          <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
        </DialogHeader>
        <DialogContent className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter full name"
          />
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter email address"
            disabled={!!editingUser}
          />
          <Select
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            options={[
              { value: 'viewer', label: 'Viewer - View only access' },
              { value: 'operator', label: 'Operator - Can perform transfers' },
              { value: 'admin', label: 'Administrator - Full access' },
            ]}
          />
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button onClick={handleCloseDialog}>
            {editingUser ? 'Save Changes' : 'Add User'}
          </Button>
        </DialogFooter>
      </Dialog>
    </Layout>
  );
}
