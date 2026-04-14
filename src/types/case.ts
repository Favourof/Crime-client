export type CaseStatus = 'open' | 'investigating' | 'closed';

export interface CaseUserRef {
  id: string;
  name: string;
  email?: string;
}

export interface Case {
  id: string;
  title: string;
  description: string;
  crimeType: string;
  location: string;
  status: CaseStatus;
  createdBy: CaseUserRef;
  assignedTo?: CaseUserRef | null;
  createdAt: string;
  updatedAt: string;
}
