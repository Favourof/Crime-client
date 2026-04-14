'use client';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Case, CaseStatus } from '@/types/case';

type CaseTableProps = {
  cases: Case[];
  onRowClick: (caseId: string) => void;
  currentUserId?: string;
};

const STATUS_STYLES: Record<CaseStatus, string> = {
  open: 'bg-slate-200 text-slate-800',
  investigating: 'bg-amber-100 text-amber-800',
  closed: 'bg-emerald-100 text-emerald-800',
};

const formatStatus = (status: CaseStatus) => {
  if (status === 'investigating') return 'Investigating';
  if (status === 'closed') return 'Closed';
  return 'Open';
};

export const CaseTable = ({ cases, onRowClick, currentUserId }: CaseTableProps) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Crime Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((caseItem) => (
            <TableRow
              key={caseItem.id}
              className="cursor-pointer transition-colors hover:bg-slate-50"
              onClick={() => onRowClick(caseItem.id)}
            >
              <TableCell className="font-medium text-slate-900">
                <div>
                  <p>{caseItem.title}</p>
                  <p className="mt-0.5 text-xs font-normal text-slate-500">{caseItem.location}</p>
                  {currentUserId && caseItem.assignedTo?.id === currentUserId ? (
                    <Badge className="mt-1 bg-sky-100 text-sky-800">Assigned to me</Badge>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="text-slate-700">
                <div>
                  <p>{caseItem.createdBy.name}</p>
                  {caseItem.createdBy.email ? (
                    <p className="mt-0.5 text-xs text-slate-500">{caseItem.createdBy.email}</p>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="capitalize text-slate-700">{caseItem.crimeType}</TableCell>
              <TableCell>
                <Badge className={STATUS_STYLES[caseItem.status]}>{formatStatus(caseItem.status)}</Badge>
              </TableCell>
              <TableCell className="text-slate-600">{new Date(caseItem.createdAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
