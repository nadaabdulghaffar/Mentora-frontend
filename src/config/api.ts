import axios from 'axios';

// إعدادات الـ API
// القيمة تُقرأ من متغير بيئة VITE_API_URL الذي يمكن تعيينه عبر ملف
// `.env` أو مباشرة عند تشغيل vite (`VITE_API_URL=http://localhost:5069/api npm run dev`).
// إذا لم يُحدد المتغير، نضع بورت التطوير الافتراضي الذي يستخدمه
// المشروع الخلفي (يتوافق مع `launchSettings.json`).
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5069/api';

// إنشاء instance من Axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// إضافة الـ token تلقائياً لكل request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// معالجة الأخطاء تلقائياً
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // في حالة انتهاء صلاحية الـ token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          console.warn('No refresh token available, redirecting to login');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          if (!window.location.href.includes('/login')) {
            window.location.href = '/login';
          }
          throw new Error('No refresh token available');
        }

        console.log('Attempting to refresh token...');
        
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          RefreshToken: refreshToken,
        });

        if (response.data?.success && response.data?.data?.accessToken) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          
          console.log('Token refreshed successfully');
          
          localStorage.setItem('accessToken', accessToken);
          
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } else {
          console.error('Token refresh response invalid:', response.data);
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError);
        
        // إزالة الـ tokens وإعادة التوجيه للـ login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // تجنب infinite redirects
        if (!window.location.href.includes('/login')) {
          console.log('Redirecting to login');
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // For other errors, just reject
    console.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
    });

    return Promise.reject(error);
  }
);


export default apiClient;
