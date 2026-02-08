
export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  image?: string;
  groundingLinks?: Array<{ title: string; uri: string }>;
}

export interface LoanScenario {
  amount: number;
  rate: number;
  tenure: number;
}

export interface RiskAnalysis {
  riskLevel: 'Low' | 'Medium' | 'High';
  summary: string;
  pros: string[];
  cons: string[];
  verdict: string;
}