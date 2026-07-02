import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Shield, ShieldCheck, Mail, Calendar, Eye, MessageCircle, Search, RefreshCw, Trash2 } from 'lucide-react';
import { forumApi, UserProfile } from '../services/forumApi';
import { useAuthState } from '../hooks/useAuth';
import AuthModal from '../components/forum/AuthModal';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, login, register, error: authError } = useAuthState();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'alpha' | 'delta'>('all');
  const [updatingRoles, setUpdatingRoles] = useState<Set<number>>(new Set());
  const [deletingUsers, setDeletingUsers] = useState<Set<number>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      setShowAuthModal(true);
      return;
    }

    if (isAuthenticated && user) {
      // Check if user is admin
      if (user.role !== 'alpha') {
        setError('Access denied. Alpha clearance required.');
        return;
      }
      loadUsers();
    }
  }, [isAuthenticated, authLoading, user]);

  useEffect(() => {
    // Filter users based on search term and role
    let filtered = users;
    
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedRole !== 'all') {
      filtered = filtered.filter(u => u.role === selectedRole);
    }
    
    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const usersData = await forumApi.getAllUsers({ limit: 100 });
      setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: number, newRole: 'alpha' | 'delta') => {
    setUpdatingRoles(prev => {
      const newSet = new Set(prev);
      newSet.add(userId);
      return newSet;
    });
    try {
      const updatedUser = await forumApi.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
    } finally {
      setUpdatingRoles(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleDeleteUser = (user: UserProfile) => {
    setUserToDelete(user);
    setShowDeleteConfirm(user.id);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    setDeletingUsers(prev => {
      const newSet = new Set(prev);
      newSet.add(userToDelete.id);
      return newSet;
    });
    
    try {
      console.log(`Attempting to delete user ${userToDelete.id} (${userToDelete.username})`);
      const result = await forumApi.deleteUserAccount(userToDelete.id);
      console.log('Delete result:', result);
      
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setShowDeleteConfirm(null);
      setUserToDelete(null);
      setError(null); // Clear any previous errors
      
      // Show success message briefly
      alert(`User ${userToDelete.username} has been successfully deleted.`);
    } catch (err) {
      console.error('Delete user error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user account';
      setError(`Failed to delete user ${userToDelete.username}: ${errorMessage}`);
      
      // Keep the modal open on error so user can retry or cancel
      // setShowDeleteConfirm(null);
      // setUserToDelete(null);
    } finally {
      setDeletingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userToDelete.id);
        return newSet;
      });
    }
  };

  const cancelDeleteUser = () => {
    setShowDeleteConfirm(null);
    setUserToDelete(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="pt-24 pb-16 px-6">
        <div className="absolute inset-0 pointer-events-none z-0 bg-grid opacity-50 scanline" />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            navigate('/');
          }}
          onLogin={login}
          onRegister={register}
          error={authError}
          isLoading={authLoading}
        />
      </div>
    );
  }

  if (authLoading || isLoading) {
    return (
      <div className="pt-24 pb-16 px-6">
        <div className="absolute inset-0 pointer-events-none z-0 bg-grid opacity-50 scanline" />
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="text-accent font-mono">ACCESSING ADMIN CLEARANCE...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !users.length) {
    return (
      <div className="pt-24 pb-16 px-6">
        <div className="absolute inset-0 pointer-events-none z-0 bg-grid opacity-50 scanline" />
        <div className="max-w-6xl mx-auto">
          <div className="mission-card border-red-500/50 bg-red-500/5">
            <div className="text-center">
              <div className="text-red-500 font-mono text-lg mb-4">ACCESS DENIED</div>
              <div className="text-sm text-muted-foreground mb-4">
                {error}
              </div>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 border border-accent text-accent hover:bg-accent hover:text-background transition font-mono text-sm"
              >
                ← RETURN TO MAIN SITE
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-6">
      <div className="absolute inset-0 pointer-events-none z-0 bg-grid opacity-50 scanline" />
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-muted-foreground hover:text-accent transition font-mono text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>RETURN TO MAIN SITE</span>
            </button>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-mono text-accent mb-2">ADMIN CONTROL PANEL</h1>
            <div className="text-xs text-muted-foreground font-mono">ALPHA CLEARANCE REQUIRED</div>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-accent" />
            <span className="text-sm font-mono text-accent">AGENT: {user?.username?.toUpperCase()}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="mission-card mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search operatives..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border font-mono text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as 'all' | 'alpha' | 'delta')}
                className="px-3 py-2 bg-background border border-border font-mono text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="all">ALL OPERATIVES</option>
                <option value="alpha">ALPHA CLEARANCE</option>
                <option value="delta">DELTA CLEARANCE</option>
              </select>
            </div>
            <button
              onClick={loadUsers}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-accent text-background font-mono text-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>REFRESH</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="mission-card text-center">
            <div className="text-2xl font-mono text-accent mb-2">{users.length}</div>
            <div className="text-sm text-muted-foreground font-mono">TOTAL OPERATIVES</div>
          </div>
          <div className="mission-card text-center">
            <div className="text-2xl font-mono text-green-500 mb-2">
              {users.filter(u => u.role === 'alpha').length}
            </div>
            <div className="text-sm text-muted-foreground font-mono">ALPHA CLEARANCE</div>
          </div>
          <div className="mission-card text-center">
            <div className="text-2xl font-mono text-blue-500 mb-2">
              {users.filter(u => u.role === 'delta').length}
            </div>
            <div className="text-sm text-muted-foreground font-mono">DELTA CLEARANCE</div>
          </div>
        </div>

        {/* Users Table */}
        <div className="mission-card">
          <div className="text-lg font-mono text-accent mb-4 flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>OPERATIVE ROSTER ({filteredUsers.length})</span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-mono">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-mono text-xs text-muted-foreground">OPERATIVE</th>
                  <th className="text-left p-3 font-mono text-xs text-muted-foreground">EMAIL</th>
                  <th className="text-left p-3 font-mono text-xs text-muted-foreground">CLEARANCE</th>
                  <th className="text-left p-3 font-mono text-xs text-muted-foreground">JOINED</th>
                  <th className="text-left p-3 font-mono text-xs text-muted-foreground">ACTIVITY</th>
                  <th className="text-left p-3 font-mono text-xs text-muted-foreground">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-accent/5 transition">
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-accent" />
                        <span className="font-mono text-sm text-accent">{user.username}</span>
                        {!user.is_active && (
                          <span className="text-xs text-red-500 font-mono">[INACTIVE]</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground font-mono">{user.email}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-1">
                        {user.role === 'alpha' ? (
                          <>
                            <ShieldCheck className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-mono text-green-500">ALPHA</span>
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-mono text-blue-500">DELTA</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-mono">
                          {formatDate(user.created_at)}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-3 text-xs font-mono text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{user.post_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{user.comment_count}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        {user.role === 'delta' ? (
                          <button
                            onClick={() => updateUserRole(user.id, 'alpha')}
                            disabled={updatingRoles.has(user.id)}
                            className="px-3 py-1 bg-green-500 text-white text-xs font-mono hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            {updatingRoles.has(user.id) ? 'PROMOTING...' : 'PROMOTE TO ALPHA'}
                          </button>
                        ) : (
                          <button
                            onClick={() => updateUserRole(user.id, 'delta')}
                            disabled={updatingRoles.has(user.id)}
                            className="px-3 py-1 bg-red-500 text-white text-xs font-mono hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            {updatingRoles.has(user.id) ? 'DEMOTING...' : 'DEMOTE TO DELTA'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user)}
                          disabled={deletingUsers.has(user.id)}
                          className="px-3 py-1 bg-red-600 text-white text-xs font-mono hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center space-x-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{deletingUsers.has(user.id) ? 'DELETING...' : 'DELETE'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <div className="text-muted-foreground font-mono text-sm">
                NO OPERATIVES FOUND
              </div>
            </div>
          )}
        </div>

        {/* Classification Footer */}
        <div className="mt-8 pt-4 border-t border-border text-center text-xs font-mono text-muted-foreground">
          CLASSIFIED ADMIN PANEL • ALPHA CLEARANCE ONLY
          <br />
          UNAUTHORIZED ACCESS IS PROHIBITED
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="mission-card max-w-md w-full border-red-500/50 bg-red-500/5">
            <div className="text-center">
              <div className="text-red-500 font-mono text-lg mb-4 flex items-center justify-center space-x-2">
                <Trash2 className="w-5 h-5" />
                <span>⚠️ ACCOUNT TERMINATION</span>
              </div>
              <div className="text-sm text-muted-foreground font-mono mb-6">
                ARE YOU CERTAIN YOU WISH TO PERMANENTLY DELETE THE ACCOUNT OF:
                <br /><br />
                <span className="text-accent font-bold">@{userToDelete.username.toUpperCase()}</span>
                <br />({userToDelete.email})
                <br /><br />
                THIS WILL REMOVE:
                <br />• ALL THEIR POSTS AND REPORTS ({userToDelete.post_count})
                <br />• ALL THEIR COMMENTS ({userToDelete.comment_count})
                <br />• THEIR COMPLETE PROFILE DATA
                <br /><br />
                <span className="text-red-500">THIS ACTION CANNOT BE REVERSED.</span>
              </div>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={cancelDeleteUser}
                  className="px-4 py-2 border border-accent font-mono text-xs hover:bg-accent hover:text-background transition"
                  disabled={deletingUsers.has(userToDelete.id)}
                >
                  ABORT MISSION
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="px-4 py-2 bg-red-500 text-white font-mono text-xs hover:bg-red-600 transition flex items-center space-x-1"
                  disabled={deletingUsers.has(userToDelete.id)}
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{deletingUsers.has(userToDelete.id) ? 'TERMINATING...' : 'CONFIRM TERMINATION'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
