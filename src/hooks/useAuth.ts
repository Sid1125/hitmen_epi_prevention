import { useState, useEffect, createContext, useContext } from 'react';
import { forumApi, User, UserProfile, LoginData, RegisterData } from '../services/forumApi';
import { emailService, EmailData } from '../services/emailService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => void;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        if (forumApi.isAuthenticated()) {
          // Fetch real user profile from API
          const userProfile = await forumApi.getCurrentUserProfile();
          const userData: User = {
            id: userProfile.id,
            username: userProfile.username,
            email: userProfile.email,
            role: userProfile.role
          };
          setUser(userData);
          localStorage.setItem('forum_user', JSON.stringify(userData));
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        forumApi.logout();
        localStorage.removeItem('forum_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await forumApi.login(data);
      
      // Fetch real user profile after login
      const userProfile = await forumApi.getCurrentUserProfile();
      const userData: User = {
        id: userProfile.id,
        username: userProfile.username,
        email: userProfile.email,
        role: userProfile.role
      };
      setUser(userData);
      localStorage.setItem('forum_user', JSON.stringify(userData));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await forumApi.register(data);
      
      // Send welcome email if EmailJS is configured and email data is provided
      if (response.email_data) {
        try {
          const configStatus = emailService.getConfigStatus();
          if (configStatus.configured) {
            await emailService.sendWelcomeEmail(response.email_data as EmailData);
            console.log('Welcome email sent successfully');
          } else {
            console.warn('EmailJS not configured:', configStatus.message);
          }
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't fail registration if email fails
        }
      }
      
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    forumApi.logout();
    localStorage.removeItem('forum_user');
    setUser(null);
    setError(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    error,
  };
};
