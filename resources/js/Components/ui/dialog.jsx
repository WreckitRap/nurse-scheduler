import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;

export const DialogContent = forwardRef(({ className = '', children, ...props }, ref) => (
    <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-gray-900/50 dark:bg-black/60" />
        <DialogPrimitive.Content
            ref={ref}
            className={cn(
                'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-xl',
                className,
            )}
            {...props}
        >
            {children}
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="h-4 w-4" />
            </DialogPrimitive.Close>
        </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
));

export const DialogHeader = ({ className = '', ...props }) => (
    <div className={cn('mb-4 flex flex-col space-y-1', className)} {...props} />
);

export const DialogTitle = forwardRef(({ className = '', ...props }, ref) => (
    <DialogPrimitive.Title ref={ref} className={cn('text-base font-semibold text-gray-900 dark:text-white', className)} {...props} />
));

export const DialogDescription = forwardRef(({ className = '', ...props }, ref) => (
    <DialogPrimitive.Description ref={ref} className={cn('text-sm text-gray-500 dark:text-gray-400', className)} {...props} />
));