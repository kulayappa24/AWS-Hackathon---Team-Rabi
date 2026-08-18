import { apiRequest } from './apiClient';
import { ApiResponse } from '../types/auth';
import {
  ClubDocument,
  DocumentDetail,
  CreateDocumentPayload,
  UpdateDocumentPayload,
  SmokeTestSuite,
  EvaluatorAskResult
} from '../types/document';
import { User } from '../types/auth';

export const documentService = {
  async getAllDocuments(): Promise<ClubDocument[]> {
    const res = await apiRequest<ApiResponse<ClubDocument[]>>('/documents');
    return res.data || [];
  },

  async getDocumentDetail(id: number): Promise<DocumentDetail> {
    const res = await apiRequest<ApiResponse<DocumentDetail>>(`/documents/${id}`);
    return res.data;
  },

  async publishDocument(payload: CreateDocumentPayload): Promise<ClubDocument> {
    const res = await apiRequest<ApiResponse<ClubDocument>>('/documents', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async updateDocument(id: number, payload: UpdateDocumentPayload): Promise<ClubDocument> {
    const res = await apiRequest<ApiResponse<ClubDocument>>(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async deleteDocument(id: number): Promise<void> {
    await apiRequest<ApiResponse<void>>(`/documents/${id}`, {
      method: 'DELETE',
    });
  },

  async reindexDocuments(): Promise<ClubDocument[]> {
    const res = await apiRequest<ApiResponse<ClubDocument[]>>('/documents/reindex', {
      method: 'POST',
    });
    return res.data || [];
  },

  async runSmokeTests(): Promise<SmokeTestSuite> {
    const res = await apiRequest<ApiResponse<SmokeTestSuite>>('/smoke-test/run');
    return res.data;
  },

  async evaluateAsk(question: string): Promise<EvaluatorAskResult> {
    return await apiRequest<EvaluatorAskResult>('/ask', {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  }
};

export const userService = {
  async getCurrentUserProfile(): Promise<User> {
    const res = await apiRequest<ApiResponse<User>>('/users/me');
    return res.data;
  }
};
