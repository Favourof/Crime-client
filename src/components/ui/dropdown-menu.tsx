import * as React from 'react';
import { cn } from '@/lib/utils';

export const DropdownMenu = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DropdownMenuTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const DropdownMenuContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('rounded-md border border-slate-200 bg-white p-2 shadow', className)} {...props} />
);
export const DropdownMenuItem = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('cursor-pointer rounded px-2 py-1 text-sm hover:bg-slate-100', className)} {...props} />
);
