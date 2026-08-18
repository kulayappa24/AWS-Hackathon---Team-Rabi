export interface SourceCitation {
  filename: string;
  section: string;
  relevanceScore?: number;
  snippet?: string;
}

export interface ChatResponse {
  messageId: number;
  sessionUuid: string;
  answer: string;
  primarySource?: SourceCitation;
  allSources: SourceCitation[];
  confidence: number;
  isFallback: boolean;
  fallbackContact?: string;
}

export type MessageSender = 'USER' | 'ASSISTANT';
export type FeedbackType = 'NONE' | 'UP' | 'DOWN';

export interface ChatMessage {
  id?: number;
  sender: MessageSender;
  content: string;
  sourceFile?: string;
  sourceSection?: string;
  confidenceScore?: number;
  isFallback?: boolean;
  feedback?: FeedbackType;
  createdAt?: string;
  primarySource?: SourceCitation;
  allSources?: SourceCitation[];
}

export interface ChatSession {
  sessionUuid: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}
