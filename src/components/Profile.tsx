import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { forumApi, UserProfile, UserProfilePublic, PostSummary } from '../services/forumApi';
import PostItem from './PostItem';

interface ProfileProps {
  isOwnProfile?: boolean;
}

const Profile: React.FC<ProfileProps> = ({ isOwnProfile = false }) => {
  const { username } = useParams<{ username?: string }>();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | UserProfilePublic | null>(null);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', email: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let profileData: UserProfile | UserProfilePublic;
        
        if (isOwnProfile) {
          profileData = await forumApi.getCurrentUserProfile();
        } else if (username) {
          profileData = await forumApi.getUserProfileByUsername(username);
        } else {
          throw new Error('No user identifier provided');
        }
        
        setProfile(profileData);
        
        // Load user's posts
        const userPosts = await forumApi.getUserPosts(profileData.id, { limit: 20 });
        setPosts(userPosts);
        
        // Set edit form data if it's own profile
        if (isOwnProfile && 'email' in profileData) {
          setEditForm({ 
            username: profileData.username, 
            email: profileData.email 
          });
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username, isOwnProfile]);

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwnProfile) return;
    
    try {
      const updatedProfile = await forumApi.updateCurrentUserProfile(editForm);
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleDeleteAccount = async () => {
    if (!isOwnProfile || isDeleting) return;
    
    try {
      setIsDeleting(true);
      await forumApi.deleteAccount();
      // Redirect to home page after successful deletion
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 px-6">
        <div className="absolute inset-0 pointer-events-none z-0 bg-grid opacity-50 scanline" />
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-accent font-mono">LOADING OPERATIVE PROFILE...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 pb-16 px-6">
        <div className="absolute inset-0 pointer-events-none z-0 bg-grid opacity-50 scanline" />
        <div className="max-w-4xl mx-auto">
          <div className="mission-card border-red-500/50 bg-red-500/5">
            <div className="text-center">
              <div className="text-red-500 font-mono text-lg mb-4">ACCESS DENIED</div>
              <div className="text-sm text-muted-foreground">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="pt-24 pb-16 px-6">
        <div className="absolute inset-0 pointer-events-none z-0 bg-grid opacity-50 scanline" />
        <div className="max-w-4xl mx-auto">
          <div className="mission-card">
            <div className="text-center">
              <div className="text-muted-foreground font-mono text-sm">OPERATIVE NOT FOUND</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-6">
      <div className="absolute inset-0 pointer-events-none z-0 bg-grid opacity-50 scanline" />
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/intel')}
          className="flex items-center space-x-2 text-muted-foreground hover:text-accent transition mb-6 font-mono text-sm"
        >
          <span>← RETURN TO INTEL</span>
        </button>

        {/* Profile Header */}
        <div className="mission-card mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-mono text-accent mb-2">
                OPERATIVE: @{profile.username.toUpperCase()}
              </h1>
              <p className="text-muted-foreground font-mono text-sm">
                ENLISTED: {formatDate(profile.created_at)}
              </p>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                CLEARANCE: ALPHA • STATUS: {profile.is_active ? 'ACTIVE' : 'INACTIVE'}
              </p>
              {!profile.is_active && (
                <span className="inline-block bg-red-500/20 text-red-500 text-xs px-2 py-1 border border-red-500/30 mt-2 font-mono">
                  INACTIVE
                </span>
              )}
            </div>
            
            {isOwnProfile && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1 border text-xs font-mono border-accent hover:bg-accent hover:text-background transition"
              >
                {isEditing ? 'CANCEL' : 'EDIT PROFILE'}
              </button>
            )}
          </div>

          {/* Profile Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 border border-accent/20 bg-accent/5">
              <div className="text-2xl font-bold text-accent font-mono">{profile.post_count}</div>
              <div className="text-xs text-muted-foreground font-mono">REPORTS</div>
            </div>
            <div className="text-center p-3 border border-accent/20 bg-accent/5">
              <div className="text-2xl font-bold text-accent font-mono">{profile.comment_count}</div>
              <div className="text-xs text-muted-foreground font-mono">COMMUNICATIONS</div>
            </div>
          </div>

          {/* Edit Form */}
          {isOwnProfile && isEditing && 'email' in profile && (
            <form onSubmit={handleEditProfile} className="border-t border-accent/20 pt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-mono text-muted-foreground mb-1">
                    USERNAME
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border font-mono text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-mono text-muted-foreground mb-1">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border font-mono text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                    required
                  />
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  type="submit"
                  className="px-3 py-1 bg-accent text-background font-mono text-xs hover:bg-accent/90 transition"
                >
                  SAVE CHANGES
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 border border-accent font-mono text-xs hover:bg-accent hover:text-background transition"
                >
                  CANCEL
                </button>
              </div>
            </form>
          )}
      </div>

        {/* Delete Account Section */}
        {isOwnProfile && (
          <div className="mission-card mb-6 border-red-500/30 bg-red-500/5">
            <h3 className="text-lg font-mono text-red-500 mb-4">DANGER ZONE</h3>
            <div className="border border-red-500/30 p-4 bg-red-500/10">
              <p className="text-sm text-muted-foreground font-mono mb-4">
                PERMANENTLY DELETE YOUR OPERATIVE ACCOUNT AND ALL ASSOCIATED DATA.
                <br />
                THIS ACTION CANNOT BE UNDONE.
              </p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-500 text-white font-mono text-xs hover:bg-red-600 transition"
                disabled={isDeleting}
              >
                {isDeleting ? 'TERMINATING...' : 'TERMINATE ACCOUNT'}
              </button>
            </div>
          </div>
        )}

        {/* User's Posts */}
        <div className="mission-card">
          <h2 className="text-lg font-mono text-accent mb-4">
            {isOwnProfile ? 'YOUR INTELLIGENCE REPORTS' : `${profile.username.toUpperCase()}'S REPORTS`}
          </h2>
          
          {posts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground font-mono text-sm">
                {isOwnProfile 
                  ? "NO REPORTS FILED • AWAITING FIRST MISSION" 
                  : "NO REPORTS ON RECORD • OPERATIVE INACTIVE"
                }
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostItem 
                  key={post.id} 
                  post={post} 
                  onClick={() => navigate(`/intel/post/${post.id}`)}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Classification Footer */}
        <div className="mt-8 pt-4 border-t border-border text-center text-xs font-mono text-muted-foreground">
          OPERATIVE PROFILE • CLASSIFIED ACCESS ONLY
          <br />
          PROFILE ID: {profile.id.toString().padStart(6, '0')} • STATUS: {profile.is_active ? 'ACTIVE' : 'INACTIVE'}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="mission-card max-w-md w-full border-red-500/50 bg-red-500/5">
            <div className="text-center">
              <div className="text-red-500 font-mono text-lg mb-4">⚠️ ACCOUNT TERMINATION</div>
              <div className="text-sm text-muted-foreground font-mono mb-6">
                ARE YOU CERTAIN YOU WISH TO PERMANENTLY DELETE YOUR OPERATIVE ACCOUNT?
                <br /><br />
                THIS WILL REMOVE:
                <br />• ALL YOUR POSTS AND REPORTS
                <br />• ALL YOUR COMMENTS
                <br />• YOUR PROFILE DATA
                <br /><br />
                <span className="text-red-500">THIS ACTION CANNOT BE REVERSED.</span>
              </div>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-accent font-mono text-xs hover:bg-accent hover:text-background transition"
                  disabled={isDeleting}
                >
                  ABORT MISSION
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-500 text-white font-mono text-xs hover:bg-red-600 transition"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'TERMINATING...' : 'CONFIRM TERMINATION'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
