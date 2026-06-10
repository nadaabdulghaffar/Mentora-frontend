export interface RecommendationItem {
  id: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  headline: string | null;
  aiMatchScore: number;
  aiMatchReasons: string[];
  status: string;
}

export interface RecommendationResponse {
  success: boolean;
  message: string;
  data: RecommendationItem[];
  errors: string[] | null;
}
