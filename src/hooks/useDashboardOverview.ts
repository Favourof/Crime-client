import { useCallback, useState } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/types/auth';
import type { Case, CaseStatus, CaseUserRef } from '@/types/case';

type RawUserRef =
  | string
  | {
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
  createdBy: RawUserRef;
  assignedTo?: RawUserRef | null;
  createdAt: string;
  updatedAt: string;
};

type CaseListResponse = {
  message: string;
  data: RawCase[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

type RawEvidence = {
  _id: string;
  type: string;
  updatedAt: string;
  custodyLog?: Array<{
    action?: string;
    timestamp?: string;
  }>;
};

type EvidenceListResponse = {
  message: string;
  data: RawEvidence[];
};

type DashboardMetrics = {
  totalCases: number;
  openCases: number;
  investigatingCases: number;
  closedCases: number;
  pendingAssignments: number;
  recentEvidenceItems: number;
};

export type RecentEvidenceActivity = {
  id: string;
  caseId: string;
  caseTitle: string;
  type: string;
  updatedAt: string;
  lastAction: string;
};

const normalizeUserRef = (value: RawUserRef | null | undefined, fallback = 'Unknown'): CaseUserRef => {
  if (!value) {
    return { id: '', name: fallback };
  }
  if (typeof value === 'string') {
    return { id: value, name: fallback };
  }
  return {
    id: value.id || value._id || '',
    name: value.name || fallback,
    email: value.email,
  };
};

const mapCase = (item: RawCase): Case => ({
  id: item._id,
  title: item.title,
  description: item.description || '',
  crimeType: item.crimeType,
  location: item.location,
  status: item.status,
  createdBy: normalizeUserRef(item.createdBy, 'Unknown Creator'),
  assignedTo: item.assignedTo ? normalizeUserRef(item.assignedTo) : null,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const fetchCaseCount = async (status?: CaseStatus) => {
  const params = new URLSearchParams({ page: '1', limit: '1' });
  if (status) params.set('status', status);
  const response = await api.get<CaseListResponse>(`/cases?${params.toString()}`);
  return response.meta?.total || 0;
};

export const useDashboardOverview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCases: 0,
    openCases: 0,
    investigatingCases: 0,
    closedCases: 0,
    pendingAssignments: 0,
    recentEvidenceItems: 0,
  });
  const [recentCases, setRecentCases] = useState<Case[]>([]);
  const [createdByMe, setCreatedByMe] = useState<Case[]>([]);
  const [assignedCases, setAssignedCases] = useState<Case[]>([]);
  const [recentEvidenceActivity, setRecentEvidenceActivity] = useState<RecentEvidenceActivity[]>([]);

  const refresh = useCallback(async (user: User | null) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const [totalCases, openCases, investigatingCases, closedCases, recentCasesResponse, openCasesResponse] = await Promise.all([
        fetchCaseCount(),
        fetchCaseCount('open'),
        fetchCaseCount('investigating'),
        fetchCaseCount('closed'),
        api.get<CaseListResponse>('/cases?page=1&limit=30'),
        api.get<CaseListResponse>('/cases?page=1&limit=100&status=open'),
      ]);

      const mappedRecentCases = (recentCasesResponse.data || []).map(mapCase);
      setRecentCases(mappedRecentCases);

      const mineCreated = mappedRecentCases.filter((item) => item.createdBy.id === user.id).slice(0, 5);
      setCreatedByMe(mineCreated);

      const recentAssigned =
        user.role === 'admin'
          ? mappedRecentCases.filter((item) => Boolean(item.assignedTo?.id)).slice(0, 5)
          : mappedRecentCases.filter((item) => item.assignedTo?.id === user.id).slice(0, 5);
      setAssignedCases(recentAssigned);

      const openCasesPage = (openCasesResponse.data || []).map(mapCase);
      const pendingAssignments = openCasesPage.filter((item) => !item.assignedTo?.id).length;

      const evidenceSourceCases = mappedRecentCases.slice(0, 10);
      const evidenceResults = await Promise.allSettled(
        evidenceSourceCases.map((caseItem) =>
          api.get<EvidenceListResponse>(`/evidence/case/${caseItem.id}`).then((response) => ({
            caseId: caseItem.id,
            caseTitle: caseItem.title,
            items: response.data || [],
          }))
        )
      );

      let recentEvidenceItems = 0;
      const evidenceActivities: RecentEvidenceActivity[] = [];
      evidenceResults.forEach((result) => {
        if (result.status !== 'fulfilled') return;
        const payload = result.value;
        recentEvidenceItems += payload.items.length;
        payload.items.forEach((item) => {
          const lastAction =
            Array.isArray(item.custodyLog) && item.custodyLog.length > 0
              ? item.custodyLog[item.custodyLog.length - 1].action || 'updated'
              : 'collected';
          evidenceActivities.push({
            id: item._id,
            caseId: payload.caseId,
            caseTitle: payload.caseTitle,
            type: item.type,
            updatedAt: item.updatedAt,
            lastAction,
          });
        });
      });

      evidenceActivities.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setRecentEvidenceActivity(evidenceActivities.slice(0, 5));

      setMetrics({
        totalCases,
        openCases,
        investigatingCases,
        closedCases,
        pendingAssignments,
        recentEvidenceItems,
      });
    } catch (err) {
      setError((err as Error).message || 'Failed to load dashboard overview');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    metrics,
    recentCases,
    createdByMe,
    assignedCases,
    recentEvidenceActivity,
    refresh,
  };
};
