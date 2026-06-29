export type Sentiment = "hot" | "warm" | "cold" | "negative";
export type DealStage = "Discovery" | "Qualified" | "Demo" | "Negotiation" | "Closed Won" | "Closed Lost" | "Nurture";

export interface AnalysisResult {
  title: string;
  sentiment: Sentiment;
  dealStage: DealStage;
  summary: string;
  objections: string[];
  competitors: string[];
  crmSummary: string[];
  actionPlan: string[];
  keyInsights: string[];
  followUpEmail: {
    subject: string;
    body: string;
  };
  nextSteps: string[];
  talkRatio?: {
    sdr: number;
    prospect: number;
  };
  callDuration?: string;
  estimatedValue?: string;
}

export interface SavedAnalysis {
  id: string;
  createdAt: number;
  transcript: string;
  result: AnalysisResult;
}

export type ViewName = "landing" | "dashboard" | "analyze" | "result" | "history" | "settings";
