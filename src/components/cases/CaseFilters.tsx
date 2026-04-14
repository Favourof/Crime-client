'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import type { CaseStatus } from '@/types/case';

type CaseFiltersProps = {
  status: CaseStatus | '';
  crimeType: string;
  onStatusChange: (value: CaseStatus | '') => void;
  onCrimeTypeChange: (value: string) => void;
};

export const CaseFilters = ({
  status,
  crimeType,
  onStatusChange,
  onCrimeTypeChange,
}: CaseFiltersProps) => {
  return (
    <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[240px_1fr] md:items-end">
      <div className="space-y-2">
        <Label htmlFor="status-filter">Status</Label>
        <Select
          id="status-filter"
          value={status}
          onChange={(event) => onStatusChange(event.target.value as CaseStatus | '')}
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="closed">Closed</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="crime-type-filter">Crime type</Label>
        <Input
          id="crime-type-filter"
          placeholder="Search by crime type (e.g. robbery, homicide)"
          value={crimeType}
          onChange={(event) => onCrimeTypeChange(event.target.value)}
        />
      </div>
    </div>
  );
};
