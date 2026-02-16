import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowRightLeft,
  FileUp,
  History,
  Settings,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['viewer', 'operator', 'admin'] },
  { path: '/transfer', icon: ArrowRightLeft, label: 'License Transfer', roles: ['operator', 'admin'] },
  { path: '/batch', icon: FileUp, label: 'Batch Upload', roles: ['operator', 'admin'] },
  { path: '/audit', icon: History, label: 'Audit Log', roles: ['viewer', 'operator', 'admin'] },
  { path: '/users', icon: Users, label: 'User Management', roles: ['admin'] },
  { path: '/settings', icon: Settings, label: 'Settings', roles: ['viewer', 'operator', 'admin'] },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();

  const roleColors = {
    viewer: 'bg-gray-100 text-gray-800',
    operator: 'bg-blue-100 text-blue-800',
    admin: 'bg-purple-100 text-purple-800',
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-40',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <ArrowRightLeft className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900">IAT License</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors',
            collapsed && 'mx-auto'
          )}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            if (!user || !item.roles.includes(user.role)) return null;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )
                  }
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-200 p-4">
        {user && (
          <div className={cn('mb-3', collapsed && 'hidden')}>
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            <Badge className={cn('mt-2', roleColors[user.role])}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
          </div>
        )}
        <button
          onClick={logout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
