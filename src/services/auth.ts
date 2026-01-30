// ✅ Frontend-only Authentication (No Backend Required)

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

interface AuthUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

// Simulate mock database in localStorage
const getMockUsers = () => JSON.parse(localStorage.getItem('mock_users') || '[]');
const setMockUsers = (users: any[]) => localStorage.setItem('mock_users', JSON.stringify(users));

const persistTokens = (tokens: AuthTokens) => {
  localStorage.setItem('accessToken', tokens.accessToken);
  localStorage.setItem('refreshToken', tokens.refreshToken);
};

// Generate mock JWT token
const generateMockToken = () => {
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
    btoa(JSON.stringify({ iat: Date.now() / 1000, exp: (Date.now() + 3600000) / 1000 })) +
    '.signature';
};

// Mock Auth API
export const authAPI = {
  registerInitial: async (firstName: string, lastName: string, email: string, password: string) => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = getMockUsers();
    
    // Check if email exists
    if (users.some((u: any) => u.email === email)) {
      return {
        success: false,
        message: 'Email already registered',
        errors: ['Email already registered'],
      } as ApiResponse<AuthUser>;
    }

    // Create new user
    const newUser = {
      userId: 'user_' + Math.random().toString(36).substr(2, 9),
      email,
      firstName,
      lastName,
      password, // In real app, this would be hashed
      role: 'mentee',
      isEmailVerified: false,
      isActive: false,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    setMockUsers(users);

    // Store pending user for role selection
    localStorage.setItem('pendingUserId', newUser.userId);
    localStorage.setItem('pendingUserEmail', email);

    return {
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: {
        userId: newUser.userId,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        isEmailVerified: false,
        isActive: false,
      },
    } as ApiResponse<AuthUser>;
  },

  verifyEmail: async (token: string) => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const email = localStorage.getItem('pendingUserEmail');
    if (!email) {
      return {
        success: false,
        message: 'Email not found',
        errors: ['No pending email verification'],
      } as ApiResponse<boolean>;
    }

    const users = getMockUsers();
    const user = users.find((u: any) => u.email === email);
    
    if (user) {
      user.isEmailVerified = true;
      setMockUsers(users);
    }

    return {
      success: true,
      message: 'Email verified successfully',
      data: true,
    } as ApiResponse<boolean>;
  },

  resendVerification: async (email: string) => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      message: 'Verification code sent',
      data: true,
    } as ApiResponse<boolean>;
  },

  completeRegistration: async (userId: string, role: 'mentee' | 'mentor') => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 700));

    const users = getMockUsers();
    const user = users.find((u: any) => u.userId === userId);

    if (!user) {
      return {
        success: false,
        message: 'User not found',
        errors: ['User does not exist'],
      } as ApiResponse<AuthUser>;
    }

    user.role = role;
    setMockUsers(users);

    return {
      success: true,
      message: 'Role updated successfully',
      data: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
      },
    } as ApiResponse<AuthUser>;
  },

  login: async (email: string, password: string) => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 900));

    const users = getMockUsers();
    const user = users.find((u: any) => u.email === email);

    if (!user || user.password !== password) {
      return {
        success: false,
        message: 'Invalid email or password',
        errors: ['Invalid credentials'],
      } as ApiResponse<AuthTokens>;
    }

    const tokens: AuthTokens = {
      accessToken: generateMockToken(),
      refreshToken: generateMockToken(),
      expiresIn: 3600,
      user: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isActive: true,
      },
    };

    persistTokens(tokens);

    return {
      success: true,
      message: 'Login successful',
      data: tokens,
    } as ApiResponse<AuthTokens>;
  },

  refreshToken: async () => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return {
        success: false,
        message: 'No refresh token found',
      } as ApiResponse<AuthTokens>;
    }

    const newTokens: AuthTokens = {
      accessToken: generateMockToken(),
      refreshToken: generateMockToken(),
      expiresIn: 3600,
      user: {
        userId: 'user_123',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'mentee',
        isEmailVerified: true,
        isActive: true,
      },
    };

    persistTokens(newTokens);

    return {
      success: true,
      message: 'Token refreshed',
      data: newTokens,
    } as ApiResponse<AuthTokens>;
  },

  logout: async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('token');
    localStorage.removeItem('pendingUserId');
    localStorage.removeItem('pendingUserEmail');

    return { success: true } as ApiResponse<null>;
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return {
        success: false,
        message: 'Not logged in',
      } as ApiResponse<AuthUser>;
    }

    // Return mock user
    return {
      success: true,
      data: {
        userId: 'user_123',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'mentee',
        isEmailVerified: true,
        isActive: true,
      },
    } as ApiResponse<AuthUser>;
  },

  forgotPassword: async (email: string) => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock: just return success
    return {
      success: true,
      message: 'Password reset email sent',
      data: true,
    } as ApiResponse<boolean>;
  },

  resetPassword: async (token: string, newPassword: string) => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock: update password for user
    const users = getMockUsers();
    // In real app, would validate token and find user
    if (users.length > 0) {
      users[0].password = newPassword;
      setMockUsers(users);
    }

    return {
      success: true,
      message: 'Password reset successfully',
      data: true,
    } as ApiResponse<boolean>;
  },
};

// User APIs
export const usersAPI = {
  me: () => authAPI.getCurrentUser(),
};

