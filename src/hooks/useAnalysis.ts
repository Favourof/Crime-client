import { useCallback, useState } from 'react';
import { api } from '@/lib/api';
import type { AnalysisResult, AnalysisUserRef } from '@/types/analysis';

type RawUserRef =
  | string
  | {
      _id?: string;
      id?: string;
      name?: string;
      email?: string;
    };

type RawAnalysisResult = {
  _id: string;
  caseId: string;
  createdBy: RawUserRef;
  prompt: string;
  response: {
    patterns: string[];
    insights: string[];
    recommendations: string[];
    confidence: 'low' | 'medium' | 'high';
  };
  provider: string;
  modelUsed: string;
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  createdAt: string;
};

type AnalysisHistoryResponse = {
  message: string;
  data: RawAnalysisResult[];
};

type RunAnalysisResponse = {
  message: string;
  data: {
    status: string;
    analysis: RawAnalysisResult;
  };
};

type PreviewPromptResponse = {
  message: string;
  data: {
    prompt: string;
  };
};

const normalizeUser = (user: RawUserRef): AnalysisUserRef => {
  if (typeof user === 'string') {
    return { id: user, name: 'Unknown analyst' };
  }

  return {
    id: user.id || user._id || '',
    name: user.name || 'Unknown analyst',
    email: user.email,
  };
};

const mapAnalysis = (item: RawAnalysisResult): AnalysisResult => ({
  id: item._id,
  caseId: item.caseId,
  createdBy: normalizeUser(item.createdBy),
  prompt: item.prompt,
  response: item.response,
  provider: item.provider,
  modelUsed: item.modelUsed,
  tokenUsage: item.tokenUsage,
  createdAt: item.createdAt,
});

export const useAnalysis = () => {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysisHistory = useCallback(async (caseId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<AnalysisHistoryResponse>(`/analysis/case/${caseId}`);
      setAnalyses(response.data.map(mapAnalysis));
    } catch (err) {
      setAnalyses([]);
      setError((err as Error).message || 'Failed to load analysis history');
    } finally {
      setLoading(false);
    }
  }, []);

  const runAnalysis = useCallback(async (caseId: string) => {
    const response = await api.post<RunAnalysisResponse>(`/analysis/case/${caseId}/run`);
    return mapAnalysis(response.data.analysis);
  }, []);

  const previewPrompt = useCallback(async (caseId: string) => {
    const response = await api.get<PreviewPromptResponse>(`/analysis/case/${caseId}/preview`);
    return response.data.prompt;
  }, []);

  const saveAnalysis = useCallback(
    async (
      caseId: string,
      payload: {
        analysis: {
          patterns: string[];
          insights: string[];
          recommendations: string[];
          confidence: 'low' | 'medium' | 'high';
        };
        provider?: string;
        model?: string;
      }
    ) => {
      const response = await api.post<RunAnalysisResponse>(`/analysis/case/${caseId}`, payload);
      return mapAnalysis(response.data.analysis);
    },
    []
  );

  return {
    analyses,
    loading,
    error,
    fetchAnalysisHistory,
    runAnalysis,
    previewPrompt,
    saveAnalysis,
  };
};
