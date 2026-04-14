import { useCallback, useState } from 'react';
import { api } from '@/lib/api';
import type { Evidence } from '@/types/evidence';

type RawOfficerRef =
  | string
  | {
      _id?: string;
      id?: string;
      name?: string;
      email?: string;
    };

type RawEvidence = {
  _id: string;
  caseId: string;
  type: 'physical' | 'digital' | 'testimonial';
  description: string;
  files: Array<{
    url: string;
    publicId: string;
    resourceType: string;
    format: string;
    size: number;
  }>;
  collectedBy: RawOfficerRef;
  custodyLog: Array<{
    officer: RawOfficerRef;
    action: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

type EvidenceListResponse = {
  message: string;
  data: RawEvidence[];
};

type EvidenceResponse = {
  message: string;
  data: RawEvidence;
};

type DeleteEvidenceResponse = {
  message: string;
  data: {
    deleted: boolean;
  };
};

type CreateEvidencePayload = {
  caseId: string;
  type: 'physical' | 'digital' | 'testimonial';
  description?: string;
  files?: File[];
};

type UpdateEvidencePayload = {
  type?: 'physical' | 'digital' | 'testimonial';
  description?: string;
  custodyAction: string;
  files?: File[];
};

const normalizeOfficer = (officer: RawOfficerRef) => {
  if (typeof officer === 'string') return officer;
  return officer?.name || officer?.id || officer?._id || 'Unknown officer';
};

const mapEvidence = (item: RawEvidence): Evidence => ({
  id: item._id,
  caseId: item.caseId,
  type: item.type,
  description: item.description || '',
  files: item.files || [],
  collectedBy: normalizeOfficer(item.collectedBy),
  custodyLog: (item.custodyLog || []).map((entry) => ({
    officer: normalizeOfficer(entry.officer),
    action: entry.action,
    timestamp: entry.timestamp,
  })),
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

export const useEvidence = () => {
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvidenceByCase = useCallback(async (caseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<EvidenceListResponse>(`/evidence/case/${caseId}`);
      setEvidences(response.data.map(mapEvidence));
    } catch (err) {
      setEvidences([]);
      setError((err as Error).message || 'Failed to load evidence');
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvidence = useCallback(async (payload: CreateEvidencePayload) => {
    const formData = new FormData();
    formData.append('caseId', payload.caseId);
    formData.append('type', payload.type);
    if (payload.description) {
      formData.append('description', payload.description);
    }
    (payload.files || []).forEach((file) => formData.append('files', file));

    const response = await api.post<EvidenceResponse>('/evidence', formData);
    return mapEvidence(response.data);
  }, []);

  const updateEvidence = useCallback(async (evidenceId: string, payload: UpdateEvidencePayload) => {
    const formData = new FormData();
    if (payload.type) {
      formData.append('type', payload.type);
    }
    if (payload.description !== undefined) {
      formData.append('description', payload.description);
    }
    formData.append('custodyAction', payload.custodyAction);
    (payload.files || []).forEach((file) => formData.append('files', file));

    const response = await api.put<EvidenceResponse>(`/evidence/${evidenceId}`, formData);
    return mapEvidence(response.data);
  }, []);

  const deleteEvidence = useCallback(async (evidenceId: string) => {
    const response = await api.delete<DeleteEvidenceResponse>(`/evidence/${evidenceId}`);
    return Boolean(response.data?.deleted);
  }, []);

  return {
    evidences,
    loading,
    error,
    fetchEvidenceByCase,
    createEvidence,
    updateEvidence,
    deleteEvidence,
  };
};
