'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export default function PaginationControls({
  page,
  totalPages,
  totalItems,
  onPageChange,
  className,
}: PaginationControlsProps) {
  if (totalItems === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2 rounded-[24px] border border-[var(--border)] bg-white/88 px-4 py-3',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="btn-secondary px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </button>
        <div className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-semibold text-slate-700">
          {page} / {totalPages}
        </div>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="btn-secondary px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
