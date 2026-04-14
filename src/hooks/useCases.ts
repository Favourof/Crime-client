import { useCallback, useState } from 'react';
import { api } from '@/lib/api';
import type { Case, CaseStatus, CaseUserRef } from '@/types/case';

type RawUserRef = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
};

type RawCase = {
  _id: string;
  title: string;
  description: string;
  crimeType: string;
  location: string;
  status: CaseStatus;
  createdBy: string | RawUserRef;
  assignedTo?: string | RawUserRef | null;
  createdAt: string;
  updatedAt: string;
};

type CasesMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type CasesResponse = {
  message: string;
  data: RawCase[];
  meta?: CasesMeta;
};

type CaseResponse = {
  message: string;
  data: RawCase;
};

type FetchCasesParams = {
  page?: number;
  limit?: number;
  status?: CaseStatus | '';
  crimeType?: string;
};

type CreateCasePayload = {
  title: string;
  crimeType: string;
  location: string;
  description?: string;
};

type UpdateCasePayload = Partial<CreateCasePayload>;
type AssignCasePayload = {
  investigatorId: string;
  confirmReassign?: boolean;
};

const DEFAULT_META: CasesMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
};

const normalizeUserRef = (
  value: RawCase['createdBy'] | RawCase['assignedTo'],
  fallbackLabel = 'Unknown User'
): CaseUserRef => {
  if (!value) {
    return { id: '', name: fallbackLabel };
  }

  if (typeof value === 'string') {
    return { id: value, name: fallbackLabel };
  }

  return {
    id: value.id || value._id || '',
    name: value.name || fallbackLabel,
    email: value.email,
  };
};

const mapCase = (item: RawCase): Case => ({
  id: item._id,
  title: item.title,
  description: item.description,
  crimeType: item.crimeType,
  location: item.location,
  status: item.status,
  createdBy: normalizeUserRef(item.createdBy, 'Unknown Creator'),
  assignedTo: item.assignedTo ? normalizeUserRef(item.assignedTo) : null,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

export const useCases = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<CasesMeta>(DEFAULT_META);

  const fetchCases = useCallback(async ({ page = 1, limit, status, crimeType }: FetchCasesParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      if (limit) {
        params.set('limit', String(limit));
      }

      if (status) {
        params.set('status', status);
      }

      if (crimeType?.trim()) {
        params.set('crimeType', crimeType.trim());
      }

      const response = await api.get<CasesResponse>(`/cases?${params.toString()}`);
      setCases(response.data.map(mapCase));
      setMeta(response.meta || { ...DEFAULT_META, page });
    } catch (err) {
      setCases([]);
      setMeta({ ...DEFAULT_META, page });
      setError((err as Error).message || 'Failed to load cases');
    } finally {
      setLoading(false);
    }
  }, []);

  const getCaseById = useCallback(async (id: string) => {
    const response = await api.get<CaseResponse>(`/cases/${id}`);
    return mapCase(response.data);
  }, []);

  const createCase = useCallback(async (payload: CreateCasePayload) => {
    const response = await api.post<CaseResponse>('/cases', payload);
    return mapCase(response.data);
  }, []);

  const updateCase = useCallback(async (id: string, payload: UpdateCasePayload) => {
    const response = await api.put<CaseResponse>(`/cases/${id}`, payload);
    return mapCase(response.data);
  }, []);

  const changeCaseStatus = useCallback(async (id: string, status: CaseStatus) => {
    const response = await api.post<CaseResponse>(`/cases/${id}/status`, { status });
    return mapCase(response.data);
  }, []);

  const assignInvestigator = useCallback(async (id: string, payload: AssignCasePayload) => {
    const response = await api.post<CaseResponse>(`/cases/${id}/assign`, payload);
    return mapCase(response.data);
  }, []);

  return {
    cases,
    loading,
    error,
    meta,
    fetchCases,
    getCaseById,
    createCase,
    updateCase,
    changeCaseStatus,
    assignInvestigator,
  };
};
