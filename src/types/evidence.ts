export interface FileObject {
  url: string;
  publicId: string;
  resourceType: string;
  format: string;
  size: number;
}

export interface CustodyLog {
  officer: string;
  action: string;
  timestamp: string;
}

export interface Evidence {
  id: string;
  caseId: string;
  type: 'physical' | 'digital' | 'testimonial';
  description: string;
  files: FileObject[];
  collectedBy: string;
  custodyLog: CustodyLog[];
  createdAt: string;
  updatedAt: string;
}
