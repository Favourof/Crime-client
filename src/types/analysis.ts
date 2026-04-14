export type Pattern = string;
export type Insight = string;
export type Recommendation = string;

export interface AnalysisUserRef {
  id: string;
  name: string;
  email?: string;
}

export interface AnalysisResult {
  id: string;
  caseId: string;
  createdBy: AnalysisUserRef;
  prompt: string;
  response: {
    patterns: Pattern[];
    insights: Insight[];
    recommendations: Recommendation[];
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
}
