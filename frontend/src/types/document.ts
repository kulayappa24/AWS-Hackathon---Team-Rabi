export interface ClubDocument {
  id: number;
  filename: string;
  title: string;
  totalChunks: number;
  fileSizeBytes: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DocumentDetail extends ClubDocument {
  content: string;
}

export interface CreateDocumentPayload {
  filename: string;
  title?: string;
  content: string;
}

export interface UpdateDocumentPayload {
  title?: string;
  content: string;
}

export interface SmokeTestResult {
  id: string;
  name: string;
  question: string;
  expectedDocument: string;
  actualDocument: string;
  answer: string;
  passed: boolean;
  score: number;
  latencyMs: number;
  citedSources: string[];
}

export interface SmokeTestSuite {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  allPassed: boolean;
  totalDurationMs: number;
  executedAt: string;
  tests: SmokeTestResult[];
}

export interface EvaluatorAskResult {
  answer: string;
  sources: Array<{
    document: string;
    chunk_id?: string;
    rank?: number;
    score?: number;
  }>;
}
