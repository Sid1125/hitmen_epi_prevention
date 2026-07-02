import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Tag, Eye, Pin, Lock, Clock } from 'lucide-react';
import { forumApi } from '../../services/forumApi';
import { useAuthState } from '../../hooks/useAuth';

interface PostSummary {
  id: number;
  title: string;
  created_at: string;
  updated_at?: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  author: { id: number; username: string };
  comment_count: number;
  tags: string[];
  like_count?: number;
  dislike_count?: number;
}

interface PostCardProps {
  post: PostSummary;
  isAuthenticated?: boolean;
  onLoginClick?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, isAuthenticated, onLoginClick }) => {
  const { user } = useAuthState();
  const navigate = useNavigate();
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const [likeCount, setLikeCount] = useState(post.like_count ?? 0);
  const [dislikeCount, setDislikeCount] = useState(post.dislike_count ?? 0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [dislikeLoading, setDislikeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated && onLoginClick) return onLoginClick();
    setLikeLoading(true);
    setError(null);
    try {
      const res = await forumApi.likePost(post.id);
      setLikeCount(res.like_count);
    } catch (err) {
      setError('Failed to like post');
    } finally {
      setLikeLoading(false);
    }
  };
  const handleDislike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated && onLoginClick) return onLoginClick();
    setDislikeLoading(true);
    setError(null);
    try {
      const res = await forumApi.dislikePost(post.id);
      setDislikeCount(res.dislike_count);
    } catch (err) {
      setError('Failed to dislike post');
    } finally {
      setDislikeLoading(false);
    }
  };
  const handleComment = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated && onLoginClick) onLoginClick();
    // else: navigate to post detail
  };
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    // Optionally, navigate to edit page or open modal
    alert('Edit functionality is available on the post detail page.');
  };
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await forumApi.deletePost(post.id);
      window.location.reload();
    } catch (err) {
      setError('Failed to delete post');
    }
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/intel/user/${post.author.username}`);
  };

  return (
    <Link 
      to={`/intel/post/${post.id}`} 
      className="mission-card hover:border-accent/30 transition-all block"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {post.is_pinned && (
            <Pin className="w-3 h-3 text-accent flex-shrink-0" />
          )}
          {post.is_locked && (
            <Lock className="w-3 h-3 text-yellow-500 flex-shrink-0" />
          )}
          <h3 className="text-lg font-mono text-accent truncate">
            {post.title}
          </h3>
        </div>
        <span className="text-sm text-muted-foreground flex items-center ml-3">
          <Clock className="w-4 h-4 mr-1" />
          {formatDate(post.created_at)}
        </span>
      </div>
      
      <div className="text-base text-muted-foreground mb-3">
        Posted by{' '}
        <span 
          className="text-foreground font-medium font-mono text-accent hover:underline cursor-pointer"
          onClick={handleUserClick}
        >
          @{post.author.username}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {post.tags.slice(0, 3).map((tag, idx) => (
          <div key={`${tag}-${idx}`} className="flex items-center space-x-1 bg-accent/10 px-2 py-1 rounded">
            <Tag className="w-3 h-3" />
            <span>{tag}</span>
          </div>
        ))}
        {post.tags.length > 3 && (
          <span className="text-muted-foreground">+{post.tags.length - 3} more</span>
        )}
      </div>
      <div className="flex space-x-4 ml-4 mt-2">
        <button
          className="flex items-center space-x-1 text-sm text-accent hover:underline"
          onClick={handleLike}
          disabled={!isAuthenticated || likeLoading}
        >
          <span>👍</span>
          <span>{likeCount}</span>
        </button>
        <button
          className="flex items-center space-x-1 text-sm text-accent hover:underline"
          onClick={handleDislike}
          disabled={!isAuthenticated || dislikeLoading}
        >
          <span>👎</span>
          <span>{dislikeCount}</span>
        </button>
        <button
          className="flex items-center space-x-1 text-sm text-accent hover:underline"
          onClick={handleComment}
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post.comment_count}</span>
        </button>
        <div className="flex items-center space-x-1">
          <Eye className="w-4 h-4" />
          <span>{post.view_count}</span>
        </div>
      </div>
      {(user?.id === post.author.id || user?.role === 'alpha') && (
        <div className="flex space-x-2 mt-2">
          {user?.id === post.author.id && (
            <button onClick={handleEdit} className="px-3 py-1 border text-sm font-mono border-accent hover:bg-accent hover:text-background transition">EDIT</button>
          )}
          <button onClick={handleDelete} className="px-3 py-1 border text-sm font-mono border-red-500 text-red-500 hover:bg-red-500 hover:text-background transition">DELETE</button>
        </div>
      )}
      {error && <div className="text-sm text-red-500 mt-1">{error}</div>}
    </Link>
  );
};

export default PostCard;
