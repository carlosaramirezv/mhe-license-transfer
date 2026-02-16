import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '../../lib/utils';

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function Layout({ children, title, subtitle }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <Header title={title} subtitle={subtitle} />

        <main className="p-6">
          {children}
        </main>

        <footer className="border-t border-gray-200 bg-white px-6 py-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} McGraw Hill &bull; Generated with design.Unosquare
        </footer>
      </div>
    </div>
  );
}
