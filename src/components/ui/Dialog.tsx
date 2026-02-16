import { useEffect, useRef, type ReactNode, type MouseEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

function Dialog({ open, onClose, children, className }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200"
    >
      <div
        className={cn(
          'relative bg-white rounded-xl shadow-xl max-h-[90vh] overflow-auto animate-in zoom-in-95 duration-200',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

function DialogHeader({ className, children, onClose }: { className?: string; children: ReactNode; onClose?: () => void }) {
  return (
    <div className={cn('px-6 py-4 border-b border-gray-200 flex items-center justify-between', className)}>
      <div>{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

function DialogTitle({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <h2 className={cn('text-lg font-semibold text-gray-900', className)}>
      {children}
    </h2>
  );
}

function DialogDescription({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <p className={cn('text-sm text-gray-500 mt-1', className)}>
      {children}
    </p>
  );
}

function DialogContent({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  );
}

function DialogFooter({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end gap-3', className)}>
      {children}
    </div>
  );
}

export { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter };
