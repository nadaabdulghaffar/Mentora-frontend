import apiClient from './api';

export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequestDto {
  message: string | null;
  language: string | null;
  history: ChatHistoryItem[] | null;
}

export interface ChatRecommendationItem {
  mentor_id: string;
  mentor_name: string;
  domain: string;
  score: number;
  match_percentage: number;
  reason: string;
}

export interface ChatProgramRecommendationItem {
  post_id: string;
  mentor_id: string;
  mentor_name: string;
  title: string;
  domain: string;
  target_level: string;
  education_level: string;
  score: number;
  match_percentage: number;
  reason: string;
}

export interface ChatCommunityRecommendationItem {
  id: string;
  score: number;
  match_percentage: number;
  reason: string;
  domain: string;
}

export interface ChatMaterialItem {
  title: string;
  url: string;
  kind: string;
  source: string;
  reason: string;
}

export interface ChatStatItem {
  label: string;
  value: string;
}

export interface ChatResponseDto {
  language: string;
  intent: string;
  response_type: 'text' | 'materials' | 'recommendation' | 'roadmap';
  answer: string;
  recommendations?: ChatRecommendationItem[];
  program_recommendations?: ChatProgramRecommendationItem[];
  community_recommendations?: ChatCommunityRecommendationItem[];
  materials?: ChatMaterialItem[];
  stats?: ChatStatItem[];
}

/**
 * Sends a chat request to the mentee chatbot endpoint.
 * Note: Chat endpoints bypass the standard ApiResponse envelope.
 */
export async function sendMenteeChat(data: ChatRequestDto): Promise<ChatResponseDto> {
  const response = await apiClient.post<ChatResponseDto>('/chat', data);
  return response.data;
}

/**
 * Sends a chat request to the mentor chatbot endpoint.
 * Note: Chat endpoints bypass the standard ApiResponse envelope.
 */
export async function sendMentorChat(data: ChatRequestDto): Promise<ChatResponseDto> {
  const response = await apiClient.post<ChatResponseDto>('/chat/mentor', data);
  return response.data;
}
