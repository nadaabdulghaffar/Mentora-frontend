// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiRequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper function for API calls
export const apiCall = async <T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> => {
  try {
    const token = localStorage.getItem('token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'حدث خطأ ما',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'خطأ في الاتصال',
    };
  }
};

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (email: string, password: string, name: string) =>
    apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve({ success: true });
  },

  verifyEmail: (email: string, code: string) =>
    apiCall('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),

  resendVerificationCode: (email: string) =>
    apiCall('/auth/resend-verification-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
};

// إضافة APIs أخرى حسب احتياجات مشروعك
export const usersAPI = {
  getProfile: () => apiCall('/users/profile'),
  updateProfile: (data: any) =>
    apiCall('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

