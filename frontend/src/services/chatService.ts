import { apiRequest } from './apiClient';
import { ApiResponse } from '../types/auth';
import { ChatResponse, ChatSession, FeedbackType } from '../types/chat';

export const chatService = {
  async askQuestion(question: string, sessionUuid?: string): Promise<ChatResponse> {
    const res = await apiRequest<ApiResponse<ChatResponse>>('/chat/ask', {
      method: 'POST',
      body: JSON.stringify({ question, sessionUuid }),
    });
    return res.data;
  },

  async getUserSessions(): Promise<ChatSession[]> {
    const res = await apiRequest<ApiResponse<ChatSession[]>>('/chat/sessions');
    return res.data || [];
  },

  async getSessionDetails(sessionUuid: string): Promise<ChatSession> {
    const res = await apiRequest<ApiResponse<ChatSession>>(`/chat/sessions/${sessionUuid}`);
    return res.data;
  },

  async sendFeedback(messageId: number, feedback: FeedbackType): Promise<void> {
    await apiRequest<ApiResponse<string>>(`/chat/messages/${messageId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    });
  }
};
