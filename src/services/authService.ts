import apiClient from '../config/api';
import { notificationSignalR } from '../notifications/services/notificationSignalR';
import type {
  ApiResponse,
  AuthUser,
  AuthTokens,
  RegistrationFlowResponse,
  RegistrationCompleteResponse,
  MentorProfile,
  MenteeProfile,
  CompleteRegistrationRequest,
  MentorProfileRequest,
  MenteeProfileRequest,
  FileUploadResponse,
} from '../types/api';

// Re-export for backward compatibility
export type { ApiResponse, AuthUser, AuthTokens, RegistrationFlowResponse, MentorProfile, MenteeProfile };

const persistAuthData = (accessToken: string, refreshToken: string, user: AuthUser) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
};

// خدمات الـ Authentication
export const authAPI = {
  // تحميل ملف (CV أو صورة)
  uploadFile: async (
    file: File,
    type: 'cv' | 'profile-picture',
    registrationToken?: string
  ): Promise<ApiResponse<FileUploadResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    if (registrationToken) {
      formData.append('registrationToken', registrationToken);
    }

    const response = await apiClient.post(`/file/upload-${type}`, formData, {
      headers: {
        'Content-Type': undefined, // Allow browser to set proper multipart boundary
      },
    });
    return response.data;
  },

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
    
    console.log('Login response:', response.data);
    
    // حفظ الـ tokens
    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken, user } = response.data.data;
      
      if (accessToken && refreshToken && user) {
        persistAuthData(accessToken, refreshToken, user);
      } else {
        console.error('Login response missing tokens or user:', response.data);
      }
    } else {
      console.error('Login failed:', response.data);
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
    const payload: CompleteRegistrationRequest = { role, registrationToken };
    const response = await apiClient.post('/auth/select-role', payload);
    return response.data;
  },

  // إكمال بروفايل الـ Mentor
  completeMentorProfile: async (
    profile: MentorProfileRequest & { cvFiles?: File[] }
  ): Promise<ApiResponse<RegistrationCompleteResponse>> => {
    const hasFiles = !!profile.cvFiles && profile.cvFiles.length > 0;

    let response: any
    if (hasFiles) {
      const formData = new FormData();
      formData.append('registrationToken', profile.registrationToken);
      if (profile.yearsOfExperience !== undefined) {
        formData.append('yearsOfExperience', String(profile.yearsOfExperience));
      }
      if (profile.linkedinUrl) {
        formData.append('linkedinUrl', profile.linkedinUrl);
      }
      if (profile.domainId) {
        formData.append('domainId', String(profile.domainId));
      }
      if (profile.bio) {
        formData.append('bio', profile.bio);
      }
      if (profile.cvUrl) {
        formData.append('cvUrl', profile.cvUrl);
      }
      if (profile.countryCode) {
        formData.append('countryCode', profile.countryCode);
      }
      if (profile.subDomainIds) {
        profile.subDomainIds.forEach((id) => formData.append('subDomainIds', String(id)));
      }
      if (profile.technologyIds) {
        profile.technologyIds.forEach((id) => formData.append('technologyIds', String(id)));
      }

      // let axios/browser set the Content-Type including boundary automatically
      response = await apiClient.post('/auth/complete-mentor-profile', formData);
    } else {
      response = await apiClient.post('/auth/complete-mentor-profile', profile);
    }

    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken, userId, email, firstName, lastName, role } = response.data.data;
      if (accessToken && refreshToken) {
        persistAuthData(accessToken, refreshToken, {
          userId,
          email,
          firstName,
          lastName,
          role,
        });
      } else {
        console.error('completeMentorProfile response missing tokens:', response.data);
      }
    }

    return response.data;
  },

  // إكمال بروفايل الـ Mentee
  completeMenteeProfile: async (profile: MenteeProfileRequest): Promise<ApiResponse<RegistrationCompleteResponse>> => {
    const response = await apiClient.post('/auth/complete-mentee-profile', profile);

    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken, userId, email, firstName, lastName, role } = response.data.data;
      if (accessToken && refreshToken) {
        persistAuthData(accessToken, refreshToken, {
          userId,
          email,
          firstName,
          lastName,
          role,
        });
      } else {
        console.error('completeMenteeProfile response missing tokens:', response.data);
      }
    }

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
      RefreshToken: refreshToken,
    });
    
    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken: newRefreshToken, user } = response.data.data;
      if (accessToken && newRefreshToken && user) {
        persistAuthData(accessToken, newRefreshToken, user);
      }
    }
    
    return response.data;
  },

  // تسجيل الخروج
  logout: async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiClient.post('/auth/logout', { RefreshToken: refreshToken });
      }
    } finally {
      await notificationSignalR.disconnect();
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

  // جلب بيانات المستخدم الحالي من السيرفر
  getMe: async (): Promise<ApiResponse<AuthUser>> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // التحقق من تسجيل الدخول
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken') || !!localStorage.getItem('refreshToken');
  },
};

export default authAPI;
