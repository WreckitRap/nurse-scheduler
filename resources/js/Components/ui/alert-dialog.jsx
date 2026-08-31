import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogPortal = AlertDialogPrimitive.Portal;

export const AlertDialogOverlay = forwardRef(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Overlay ref={ref} className={cn('fixed inset-0 z-50 bg-gray-900/50', className)} {...props} />
));

export const AlertDialogContent = forwardRef(({ className, ...props }, ref) => (
    <AlertDialogPortal>
        <AlertDialogOverlay />
        <AlertDialogPrimitive.Content
            ref={ref}
            className={cn(
                'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white p-6 shadow-xl',
                className,
            )}
            {...props}
        />
    </AlertDialogPortal>
));

export const AlertDialogHeader = ({ className = '', ...props }) => (
    <div className={cn('flex flex-col space-y-2', className)} {...props} />
);

export const AlertDialogFooter = ({ className = '', ...props }) => (
    <div className={cn('mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />
);

export const AlertDialogTitle = forwardRef(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Title ref={ref} className={cn('text-base font-semibold text-gray-900', className)} {...props} />
));

export const AlertDialogDescription = forwardRef(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Description ref={ref} className={cn('text-sm text-gray-500', className)} {...props} />
));

export const AlertDialogCancel = forwardRef(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Cancel
        ref={ref}
        className={cn('rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50', className)}
        {...props}
    />
));

export const AlertDialogAction = forwardRef(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Action
        ref={ref}
        className={cn('rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700', className)}
        {...props}
    />
));