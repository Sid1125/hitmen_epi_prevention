import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock } from 'lucide-react';
import { forumApi } from '../../services/forumApi';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await forumApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      
      setSuccess(true);
      setTimeout(() => {
        resetForm();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-accent/30 p-6 w-full max-w-md relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2 mb-6">
          <Lock className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-mono text-accent">CHANGE PASSWORD</h2>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="text-green-500 font-mono mb-2">✓ PASSWORD UPDATED</div>
            <div className="text-sm text-muted-foreground">
              Your password has been changed successfully
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-mono text-accent mb-2">
                CURRENT PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-background border border-accent/30 px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent pr-10"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-mono text-accent mb-2">
                NEW PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-background border border-accent/30 px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent pr-10"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-mono text-accent mb-2">
                CONFIRM NEW PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-background border border-accent/30 px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent pr-10"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-xs font-mono">
                {error}
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 border text-sm font-mono border-accent hover:bg-accent hover:text-background transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleClose}
                className="text-xs font-mono text-muted-foreground hover:text-foreground transition"
                disabled={isLoading}
              >
                CANCEL
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-accent/20 text-center text-xs font-mono text-muted-foreground">
          <div className="mb-1">SECURITY NOTICE</div>
          <div>Password must be at least 6 characters long</div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
