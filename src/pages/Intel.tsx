import { useState, useEffect } from 'react';
import { Users, AlertTriangle } from 'lucide-react';
import { forumApi, PostSummary } from '../services/forumApi';
import PostCard from '../components/forum/PostCard';
import AuthModal from '../components/forum/AuthModal';
import CreatePost from '../components/forum/CreatePost';
import ProfileDropdown from '../components/forum/ProfileDropdown';
import { useAuthState } from '../hooks/useAuth';

const Intel = () => {
  const { isAuthenticated, isLoading: authLoading, login, register, logout, error: authError, user } = useAuthState();
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadInitialPosts();
  }, []);

  const loadInitialPosts = async () => {
    try {
      setIsLoading(true);
      const initialPosts = await forumApi.getPosts({ skip: 0, limit: 10 });
      setPosts(initialPosts);
      setHasLoadedInitial(true);
    } catch (error) {
      console.error('Failed to load initial posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMorePosts = async () => {
    try {
      setIsLoading(true);
      const newPosts = await forumApi.getPosts({ skip: posts.length, limit: 10 });
      setPosts((prev) => [...prev, ...newPosts]);
    } catch (error) {
      console.error('Failed to load more posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (data: { title: string; content: string; tags: string[] }) => {
    try {
      setShowCreateModal(false);
      const newPost = await forumApi.createPost(data);
      setPosts((prev) => [newPost, ...prev]);
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  // Filter posts by search (username or title)
  const filteredPosts = posts.filter(post => {
    const searchLower = search.toLowerCase();
    return (
      post.title.toLowerCase().includes(searchLower) ||
      post.author.username.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="pt-24 pb-16 px-6 content-readable">
      <div className="absolute inset-0 pointer-events-none z-0 bg-grid opacity-50 scanline" />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-accent" />
            <h1 className="text-4xl font-display font-medium tracking-wide">
              INTELLIGENCE
            </h1>
            <Users className="w-5 h-5 text-accent" />
          </div>
          <div className="h-px w-24 bg-accent mx-auto opacity-60 mb-4" />
          <p className="text-sm font-mono text-muted-foreground">
            HARMFUL CONTENT MONITORING & COMMUNITY REPORTS
          </p>
        </div>

        {/* Show Priority Alert */}
        <div className="mission-card border-red-500/50 bg-red-500/5 mb-8">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-mono text-red-500 font-medium">
                  PRIORITY ALERT
                </h3>
                <span className="text-xs font-mono text-red-500">
                  LIVE
                </span>
              </div>
              <p className="text-sm mb-3">
                New wave of inappropriate content accounts detected. Estimated
                reach: <span className="text-red-500 font-medium">50K+ minors exposed</span>. Community reporting coordination activated.
              </p>
              <div className="text-xs font-mono text-red-500">
                SOURCE: @YOU.ARE.A.HITMAN COMMUNITY • CONFIDENCE: 98% • ACTION:
                MASS REPORTING INITIATED
              </div>
            </div>
          </div>
        </div>

        {/* User Status and Controls */}
        <div className="flex justify-between items-center mb-4 p-3 border border-accent/30 bg-accent/5">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-mono text-accent">
                OPERATIVE: {user?.username?.toUpperCase()}
              </span>
              <span className="text-xs text-muted-foreground font-mono">CLEARANCE: {user?.role?.toUpperCase() || 'ALPHA'}</span>
            </div>
          ) : (
            <span className="text-sm font-mono text-accent">PUBLIC ACCESS</span>
          )}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-3 py-1 border text-xs font-mono border-accent hover:bg-accent hover:text-background transition"
                >
                  NEW REPORT
                </button>
                <ProfileDropdown username={user?.username || ''} onLogout={logout} />
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-3 py-1 border text-xs font-mono border-accent hover:bg-accent hover:text-background transition"
              >
                LOGIN / REGISTER
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex justify-center">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by username or post title..."
            className="w-full max-w-md px-4 py-2 border border-accent rounded bg-background text-accent placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-mono text-accent mb-6">
            RECENT INTELLIGENCE FORUM
          </h2>
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} isAuthenticated={isAuthenticated} onLoginClick={() => setShowAuthModal(true)} />
          ))}
          <div className="text-center mt-6">
            <button
              onClick={loadMorePosts}
              disabled={isLoading}
              className="px-4 py-2 border text-sm font-mono border-accent hover:bg-accent hover:text-background transition"
            >
              {isLoading ? "Loading..." : "Load More"}
            </button>
          </div>
        </div>

        <div className="mt-12 mission-card">
          <h3 className="font-mono text-accent mb-4">THREAT ASSESSMENT SUMMARY</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-accent">{posts.length}</div>
              <div className="text-xs font-mono text-muted-foreground">
                TOTAL FORUM POSTS
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-yellow-500">{posts.reduce((total, post) => total + (post.comment_count || 0), 0)}</div>
              <div className="text-xs font-mono text-muted-foreground">
                TOTAL COMMENTS
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border text-center text-xs font-mono text-muted-foreground">
            NEXT UPDATE: <span className="classified-text">REDACTED</span> •
            ANALYST: <span className="classified-text">REDACTED</span>
          </div>
        </div>
      </div>

      {/* Show Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={async (...args) => {
          await login(...args);
          setShowAuthModal(false);
        }}
        onRegister={async (...args) => {
          await register(...args);
          setShowAuthModal(false);
        }}
        error={authError}
        isLoading={authLoading}
      />

      {/* Show Create Post Modal */}
      <CreatePost
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePost}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Intel;
