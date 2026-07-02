import React, { useState } from 'react';
import { X, User, Mail, Lock, AlertCircle } from 'lucide-react';
import { LoginData, RegisterData } from '../../services/forumApi';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (data: LoginData) => Promise<void>;
  onRegister: (data: RegisterData) => Promise<void>;
  error?: string | null;
  isLoading?: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  error,
  isLoading,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'login') {
        await onLogin({
          username: formData.username,
          password: formData.password,
        });
      } else {
        await onRegister({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
      }
      onClose();
    } catch (err) {
      // Error is handled by the parent component
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-accent/30 p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl font-mono text-accent mb-2">
            {mode === 'login' ? 'ACCESS INTEL FORUM' : 'JOIN HITMEN NETWORK'}
          </h2>
          <div className="h-px w-16 bg-accent mx-auto opacity-60" />
        </div>

        {error && (
          <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/30 p-3 mb-4">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-base text-red-500">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-base font-mono text-muted-foreground mb-1">
              USERNAME
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 rounded edit-input font-mono text-base focus:outline-none"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-base font-mono text-muted-foreground mb-1">
                EMAIL
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 rounded edit-input font-mono text-base focus:outline-none"
                  placeholder="Enter email"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-base font-mono text-muted-foreground mb-1">
              PASSWORD
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 rounded edit-input font-mono text-base focus:outline-none"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-accent text-background font-mono text-base hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? 'PROCESSING...' : mode === 'login' ? 'AUTHENTICATE' : 'REGISTER'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-base text-muted-foreground hover:text-accent font-mono"
          >
            {mode === 'login' 
              ? 'Need access? Register here' 
              : 'Already have access? Login here'
            }
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-border text-sm text-muted-foreground font-mono text-center">
          CLASSIFIED FORUM • AUTHORIZED PERSONNEL ONLY
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
