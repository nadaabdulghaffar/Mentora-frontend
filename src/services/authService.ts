import apiClient from '../config/api';
import type {
  ApiResponse,
  AuthUser,
  AuthTokens,
  RegistrationFlowResponse,
  MentorProfile,
  MenteeProfile,
} from '../types/api';

// Re-export for backward compatibility
export type { ApiResponse, AuthUser, AuthTokens, RegistrationFlowResponse, MentorProfile, MenteeProfile };

// خدمات الـ Authentication
export const authAPI = {
  // التسجيل الأولي
  registerInitial: async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<ApiResponse<RegistrationFlowResponse>> => {
    const response = await apiClient.post('/auth/register', {
      firstName,
      lastName,
      email,
      password,
    });
    return response.data;
  },

  // تسجيل الدخول
  login: async (email: string, password: string): Promise<ApiResponse<AuthTokens>> => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    
    // حفظ الـ tokens
    if (response.data.success && response.data.data) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  },

  // تأكيد البريد الإلكتروني
  verifyEmail: async (token: string, email: string): Promise<ApiResponse<RegistrationFlowResponse>> => {
    const response = await apiClient.post('/auth/verify-email', {
      token,
      email,
    });
    return response.data;
  },

  // إعادة إرسال كود التحقق
  resendVerificationCode: async (email: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.post('/auth/resend-verification', {
      email,
    });
    return response.data;
  },

  // اختيار الدور (Mentor/Mentee)
  selectRole: async (
    role: 'mentee' | 'mentor',
    registrationToken: string
  ): Promise<ApiResponse<RegistrationFlowResponse>> => {
    const response = await apiClient.post('/auth/select-role', {
      role,
      registrationToken,
    });
    return response.data;
  },

  // إكمال بروفايل الـ Mentor
  completeMentorProfile: async (profile: MentorProfile): Promise<ApiResponse<null>> => {
    const response = await apiClient.post('/auth/complete-mentor-profile', profile);
    return response.data;
  },

  // إكمال بروفايل الـ Mentee
  completeMenteeProfile: async (profile: MenteeProfile): Promise<ApiResponse<null>> => {
    const response = await apiClient.post('/auth/complete-mentee-profile', profile);
    return response.data;
  },

  // طلب إعادة تعيين كلمة المرور
  requestPasswordReset: async (email: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.post('/auth/forgot-password', {
      email,
    });
    return response.data;
  },

  // Alias for legacy usage
  forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.post('/auth/forgot-password', {
      email,
    });
    return response.data;
  },

  // إعادة تعيين كلمة المرور
  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },

  // تحديث الـ Token
  refreshToken: async (refreshToken: string): Promise<ApiResponse<AuthTokens>> => {
    const response = await apiClient.post('/auth/refresh-token', {
      refreshToken,
    });
    
    if (response.data.success && response.data.data) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    }
    
    return response.data;
  },

  // تسجيل الخروج
  logout: async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // الحصول على بيانات المستخدم الحالي
  getCurrentUser: (): AuthUser | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  // التحقق من تسجيل الدخول
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken');
  },
};

export default authAPI;
