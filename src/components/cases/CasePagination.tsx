'use client';

import { Button } from '@/components/ui/button';

type CasePaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
};

export const CasePagination = ({
  page,
  totalPages,
  total,
  onPrevious,
  onNext,
}: CasePaginationProps) => {
  const disablePrevious = page <= 1;
  const disableNext = page >= totalPages;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600">{total} case records</p>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={onPrevious} disabled={disablePrevious}>
          Previous
        </Button>
        <p className="min-w-24 text-center text-sm text-slate-700">
          Page {page} / {totalPages}
        </p>
        <Button variant="outline" onClick={onNext} disabled={disableNext}>
          Next
        </Button>
      </div>
    </div>
  );
};
