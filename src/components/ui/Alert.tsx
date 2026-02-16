import type { HTMLAttributes, ReactNode } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  onDismiss?: () => void;
}

function Alert({ className, variant = 'info', title, children, onDismiss, ...props }: AlertProps) {
  const variants = {
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: <Info className="h-5 w-5 text-blue-600" />,
      title: 'text-blue-800',
      content: 'text-blue-700',
    },
    success: {
      container: 'bg-green-50 border-green-200',
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      title: 'text-green-800',
      content: 'text-green-700',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
      title: 'text-yellow-800',
      content: 'text-yellow-700',
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
      title: 'text-red-800',
      content: 'text-red-700',
    },
  };

  const style = variants[variant];

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-lg border',
        style.container,
        className
      )}
      role="alert"
      {...props}
    >
      <div className="flex-shrink-0">{style.icon}</div>
      <div className="flex-1">
        {title && (
          <h4 className={cn('font-medium mb-1', style.title)}>{title}</h4>
        )}
        <div className={cn('text-sm', style.content)}>{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export { Alert };
