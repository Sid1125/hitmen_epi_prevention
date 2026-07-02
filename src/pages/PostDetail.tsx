import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, MessageCircle, Tag, Clock, Pin, Lock, User } from 'lucide-react';
import { forumApi, Post, Comment } from '../services/forumApi';
import { useAuthState } from '../hooks/useAuth';
import AuthModal from '../components/forum/AuthModal';

interface CommentComponentProps {
  comment: Comment;
  depth: number;
  user: any;
  editingCommentId: number | null;
  editCommentContent: string;
  replyingTo: number | null;
  replyContent: string;
  formatDate: (dateString: string) => string;
  formatContent: (content: string) => JSX.Element[];
  handleLikeComment: (commentId: number) => void;
  handleDislikeComment: (commentId: number) => void;
  handleReply: (commentId: number) => void;
  handleEditComment: (comment: Comment) => void;
  handleDeleteComment: (commentId: number) => void;
  handleUpdateComment: (e: React.FormEvent) => void;
  handleSubmitReply: (e: React.FormEvent) => void;
  setEditingCommentId: (id: number | null) => void;
  setEditCommentContent: (content: string) => void;
  setReplyingTo: (id: number | null) => void;
  setReplyContent: (content: string) => void;
}

const CommentComponent: React.FC<CommentComponentProps> = ({
  comment,
  depth,
  user,
  editingCommentId,
  editCommentContent,
  replyingTo,
  replyContent,
  formatDate,
  formatContent,
  handleLikeComment,
  handleDislikeComment,
  handleReply,
  handleEditComment,
  handleDeleteComment,
  handleUpdateComment,
  handleSubmitReply,
  setEditingCommentId,
  setEditCommentContent,
  setReplyingTo,
  setReplyContent,
}) => {
  const maxDepth = 5; // Limit nesting depth to avoid UI issues
  const marginLeft = Math.min(depth * 20, maxDepth * 20); // 20px per level, max 100px
  
  return (
    <div 
      className={`mission-card bg-accent/5 ${depth > 0 ? 'border-l-2 border-accent/30' : ''}`}
      style={{ marginLeft: `${marginLeft}px` }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <User className="w-3 h-3 text-accent" />
          <Link 
            to={`/intel/user/${comment.author.username}`} 
            className="text-base font-mono text-accent hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            @{comment.author.username}
          </Link>
          {depth > 0 && <span className="text-sm text-muted-foreground font-mono">↳ REPLY</span>}
        </div>
        <span className="text-sm text-muted-foreground font-mono flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          {formatDate(comment.created_at)}
        </span>
      </div>
      
      {editingCommentId === comment.id ? (
        <form onSubmit={handleUpdateComment} className="mb-2">
          <textarea 
            className="w-full mb-2 p-2 rounded edit-textarea font-mono min-h-[80px]" 
            value={editCommentContent} 
            onChange={e => setEditCommentContent(e.target.value)} 
            required 
          />
          <div className="flex space-x-2">
            <button type="submit" className="px-3 py-1 bg-accent text-background">Save</button>
            <button type="button" onClick={() => setEditingCommentId(null)} className="px-3 py-1 border">Cancel</button>
          </div>
        </form>
      ) : (
        <div className="text-base text-foreground">{formatContent(comment.content)}</div>
      )}
      
      <div className="flex space-x-2 mt-2">
        <button onClick={() => handleLikeComment(comment.id)} className="text-sm text-accent">
          👍 {comment.like_count ?? 0}
        </button>
        <button onClick={() => handleDislikeComment(comment.id)} className="text-sm text-accent">
          👎 {comment.dislike_count ?? 0}
        </button>
        {depth < maxDepth && (
          <button onClick={() => handleReply(comment.id)} className="text-sm text-accent">Reply</button>
        )}
        {/* Show edit/delete options for comment author or admin */}
        {(user?.id === comment.author_id || user?.role === 'alpha') && (
          <>
            {user?.id === comment.author_id && (
              <button onClick={() => handleEditComment(comment)} className="text-sm text-yellow-500">Edit</button>
            )}
            <button onClick={() => handleDeleteComment(comment.id)} className="text-sm text-red-500">Delete</button>
          </>
        )}
      </div>
      
      {replyingTo === comment.id && (
        <form onSubmit={handleSubmitReply} className="mt-2">
          <textarea 
            className="w-full mb-2 p-2 rounded edit-textarea font-mono min-h-[80px]" 
            value={replyContent} 
            onChange={e => setReplyContent(e.target.value)} 
            required 
          />
          <div className="flex space-x-2">
            <button type="submit" className="px-3 py-1 bg-accent text-background">Send</button>
            <button type="button" onClick={() => setReplyingTo(null)} className="px-3 py-1 border">Cancel</button>
          </div>
        </form>
      )}
      
      {/* Recursively render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentComponent
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              user={user}
              editingCommentId={editingCommentId}
              editCommentContent={editCommentContent}
              replyingTo={replyingTo}
              replyContent={replyContent}
              formatDate={formatDate}
              formatContent={formatContent}
              handleLikeComment={handleLikeComment}
              handleDislikeComment={handleDislikeComment}
              handleReply={handleReply}
              handleEditComment={handleEditComment}
              handleDeleteComment={handleDeleteComment}
              handleUpdateComment={handleUpdateComment}
              handleSubmitReply={handleSubmitReply}
              setEditingCommentId={setEditingCommentId}
              setEditCommentContent={setEditCommentContent}
              setReplyingTo={setReplyingTo}
              setReplyContent={setReplyContent}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, login, register, error: authError } = useAuthState();
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likeCount, setLikeCount] = useState(post?.like_count ?? 0);
  const [dislikeCount, setDislikeCount] = useState(post?.dislike_count ?? 0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [dislikeLoading, setDislikeLoading] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [editingPost, setEditingPost] = useState(false);
  const [editPostData, setEditPostData] = useState({ title: '', content: '', tags: [] as string[] });
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      setShowAuthModal(true);
      return;
    }

    if (isAuthenticated && postId) {
      loadPost();
    }
  }, [isAuthenticated, authLoading, postId]);

  useEffect(() => {
    if (post) {
      setLikeCount(post.like_count ?? 0);
      setDislikeCount(post.dislike_count ?? 0);
    }
  }, [post]);

  const loadPost = async () => {
    if (!postId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const [postData, commentsData] = await Promise.all([
        forumApi.getPost(parseInt(postId)),
        forumApi.getCommentsByPost(parseInt(postId))
      ]);
      
      setPost(postData);
      setComments(commentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const formatContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => (
      <span key={index}>
        {line}
        {index < lines.length - 1 && <br />}
      </span>
    ));
  };

  const handleLike = async () => {
    if (!isAuthenticated) return setShowAuthModal(true);
    setLikeLoading(true);
    setError(null);
    try {
      const res = await forumApi.likePost(post!.id);
      setLikeCount(res.like_count);
    } catch (err) {
      setError('Failed to like post');
    } finally {
      setLikeLoading(false);
    }
  };
  const handleDislike = async () => {
    if (!isAuthenticated) return setShowAuthModal(true);
    setDislikeLoading(true);
    setError(null);
    try {
      const res = await forumApi.dislikePost(post!.id);
      setDislikeCount(res.dislike_count);
    } catch (err) {
      setError('Failed to dislike post');
    } finally {
      setDislikeLoading(false);
    }
  };
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return setShowAuthModal(true);
    setCommentLoading(true);
    setError(null);
    try {
      await forumApi.createComment({ post_id: post!.id, content: commentInput });
      setCommentInput('');
      // Reload comments
      const commentsData = await forumApi.getCommentsByPost(post!.id);
      setComments(commentsData);
    } catch (err) {
      setError('Failed to post comment');
    } finally {
      setCommentLoading(false);
    }
  };

  // Post edit handlers
  const handleEditPost = () => {
    if (!post) return;
    setEditPostData({ title: post.title, content: post.content, tags: post.tags });
    setEditingPost(true);
  };
  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await forumApi.updatePost(post!.id, editPostData);
      setPost(updated);
      setEditingPost(false);
    } catch (err) {
      setError('Failed to update post');
    }
  };
  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await forumApi.deletePost(post!.id);
      navigate('/intel');
    } catch (err) {
      setError('Failed to delete post');
    }
  };
  // Comment edit/delete/reply handlers
  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditCommentContent(comment.content);
  };
  const handleUpdateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCommentId == null) return;
    try {
      await forumApi.updateComment(editingCommentId, editCommentContent);
      setEditingCommentId(null);
      setEditCommentContent('');
      // Reload comments
      const commentsData = await forumApi.getCommentsByPost(post!.id);
      setComments(commentsData);
    } catch (err) {
      setError('Failed to update comment');
    }
  };
  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await forumApi.deleteComment(commentId);
      // Always reload comments to handle both top-level and nested comment deletions
      const commentsData = await forumApi.getCommentsByPost(post!.id);
      setComments(commentsData);
    } catch (err) {
      setError('Failed to delete comment');
    }
  };
  const handleReply = (commentId: number) => {
    setReplyingTo(commentId);
    setReplyContent('');
  };
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingTo) return;
    try {
      await forumApi.createComment({ post_id: post!.id, content: replyContent, parent_id: replyingTo });
      setReplyingTo(null);
      setReplyContent('');
      // Reload comments
      const commentsData = await forumApi.getCommentsByPost(post!.id);
      setComments(commentsData);
    } catch (err) {
      setError('Failed to post reply');
    }
  };
  const handleLikeComment = async (commentId: number) => {
    try {
      await forumApi.likeComment(commentId);
      // Reload comments
      const commentsData = await forumApi.getCommentsByPost(post!.id);
      setComments(commentsData);
    } catch {}
  };
  const handleDislikeComment = async (commentId: number) => {
    try {
      await forumApi.dislikeComment(commentId);
      // Reload comments
      const commentsData = await forumApi.getCommentsByPost(post!.id);
      setComments(commentsData);
    } catch {}
  };

  if (!isAuthenticated) {
    return (
      <div className="pt-24 pb-16 px-6">
        <div className="absolute inset-0 pointer-events-none z-0 bg-grid opacity-50 scanline" />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            navigate('/intel');
          }}
          onLogin={login}
          onRegister={register}
          error={authError}
          isLoading={authLoading}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pt-24 pb-16 px-6">
        <div className="absolute inset-0 pointer-events-none z-0 bg-grid opacity-50 scanline" />
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-accent font-mono">LOADING CLASSIFIED REPORT...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="pt-24 pb-16 px-6">
        <div className="absolute inset-0 pointer-events-none z-0 bg-grid opacity-50 scanline" />
        <div className="max-w-4xl mx-auto">
          <div className="mission-card border-red-500/50 bg-red-500/5">
            <div className="text-center">
              <div className="text-red-500 font-mono text-lg mb-4">MISSION COMPROMISED</div>
              <div className="text-sm text-muted-foreground">
                {error || 'Intelligence report not found or has been classified.'}
              </div>
              <button
                onClick={() => navigate('/intel')}
                className="mt-4 px-4 py-2 border border-accent text-accent hover:bg-accent hover:text-background transition font-mono text-sm"
              >
                ← RETURN TO INTEL
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-6 content-readable">
      <div className="absolute inset-0 pointer-events-none z-0 bg-grid opacity-50 scanline" />
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/intel')}
          className="flex items-center space-x-2 text-muted-foreground hover:text-accent transition mb-6 font-mono text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO INTEL</span>
        </button>

        {/* Post Content */}
        <div className="mission-card">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {post.is_pinned && <Pin className="w-4 h-4 text-accent flex-shrink-0" />}
              {post.is_locked && <Lock className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
              <h1 className="text-xl font-mono text-accent">{post.title}</h1>
            </div>
            <div className="text-xs font-mono text-muted-foreground flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {formatDate(post.created_at)}
            </div>
          </div>

          {/* Author Info */}
          <div className="flex items-center justify-between mb-6 p-3 border border-accent/20 bg-accent/5">
            <div className="flex items-center space-x-3">
              <User className="w-4 h-4 text-accent" />
              <div>
                <div className="text-sm font-mono text-accent">
                  OPERATIVE: 
                  <Link 
                    to={`/intel/user/${post.author.username}`} 
                    className="text-accent hover:underline ml-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    @{post.author.username.toUpperCase()}
                  </Link>
                </div>
                <div className="text-xs text-muted-foreground font-mono">CLEARANCE: ALPHA</div>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-xs font-mono text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{post.view_count}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-3 h-3" />
                <span>{comments.length}</span>
              </div>
              <button
                className="flex items-center space-x-1 text-accent hover:underline"
                onClick={handleLike}
                disabled={likeLoading}
              >
                <span>👍</span>
                <span>{likeCount}</span>
              </button>
              <button
                className="flex items-center space-x-1 text-accent hover:underline"
                onClick={handleDislike}
                disabled={dislikeLoading}
              >
                <span>👎</span>
                <span>{dislikeCount}</span>
              </button>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, index) => (
                <div key={index} className="flex items-center space-x-1 bg-accent/10 border border-accent/30 px-2 py-1 text-xs font-mono">
                  <Tag className="w-3 h-3" />
                  <span>{tag}</span>
                </div>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <div className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
              {formatContent(post.content)}
            </div>
          </div>
          {user?.id === post.author_id && (
            <div className="flex space-x-2 mt-2">
              <button onClick={handleEditPost} className="px-3 py-1 border text-xs font-mono border-accent hover:bg-accent hover:text-background transition">EDIT</button>
              <button onClick={handleDeletePost} className="px-3 py-1 border text-xs font-mono border-red-500 text-red-500 hover:bg-red-500 hover:text-background transition">DELETE</button>
            </div>
          )}
        </div>
        {editingPost && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <form onSubmit={handleUpdatePost} className="bg-background p-6 rounded border border-accent w-full max-w-lg">
              <h2 className="text-lg font-mono mb-4">Edit Post</h2>
              <input className="w-full mb-2 p-2 rounded edit-input font-mono" value={editPostData.title} onChange={e => setEditPostData(d => ({ ...d, title: e.target.value }))} required />
              <textarea className="w-full mb-2 p-2 rounded edit-textarea font-mono min-h-[120px]" value={editPostData.content} onChange={e => setEditPostData(d => ({ ...d, content: e.target.value }))} required />
              <input className="w-full mb-2 p-2 rounded edit-input font-mono" value={editPostData.tags.join(',')} onChange={e => setEditPostData(d => ({ ...d, tags: e.target.value.split(',').map(t => t.trim()) }))} placeholder="tags,comma,separated" />
              <div className="flex space-x-2">
                <button type="submit" className="px-4 py-2 bg-accent text-background">Save</button>
                <button type="button" onClick={() => setEditingPost(false)} className="px-4 py-2 border">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-8">
          <h3 className="text-lg font-mono text-accent mb-4">
            OPERATIVE COMMUNICATIONS ({comments.length})
          </h3>
          
          {/* Comment Form (gated) */}
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              className="w-full px-4 py-2 bg-background border border-border font-mono text-sm focus:outline-none focus:ring-1 focus:ring-accent h-20 resize-none mb-2"
              placeholder={isAuthenticated ? "Write a comment..." : "Login to comment"}
              value={commentInput}
              onChange={e => setCommentInput(e.target.value)}
              disabled={!isAuthenticated || commentLoading}
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-accent text-background font-mono text-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              disabled={!isAuthenticated || commentLoading || !commentInput.trim()}
            >
              {commentLoading ? 'Posting...' : 'Post Comment'}
            </button>
          </form>

          {comments.length === 0 ? (
            <div className="mission-card text-center">
              <div className="text-muted-foreground font-mono text-sm">
                NO COMMUNICATIONS LOGGED
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentComponent 
                  key={comment.id} 
                  comment={comment} 
                  depth={0}
                  user={user}
                  editingCommentId={editingCommentId}
                  editCommentContent={editCommentContent}
                  replyingTo={replyingTo}
                  replyContent={replyContent}
                  formatDate={formatDate}
                  formatContent={formatContent}
                  handleLikeComment={handleLikeComment}
                  handleDislikeComment={handleDislikeComment}
                  handleReply={handleReply}
                  handleEditComment={handleEditComment}
                  handleDeleteComment={handleDeleteComment}
                  handleUpdateComment={handleUpdateComment}
                  handleSubmitReply={handleSubmitReply}
                  setEditingCommentId={setEditingCommentId}
                  setEditCommentContent={setEditCommentContent}
                  setReplyingTo={setReplyingTo}
                  setReplyContent={setReplyContent}
                />
              ))}
            </div>
          )}
          {error && <div className="text-xs text-red-500 mt-2">{error}</div>}
        </div>

        {/* Classification Footer */}
        <div className="mt-8 pt-4 border-t border-border text-center text-xs font-mono text-muted-foreground">
          CLASSIFIED INTELLIGENCE REPORT • AUTHORIZED ACCESS ONLY
          <br />
          REPORT ID: {post.id.toString().padStart(6, '0')} • STATUS: ACTIVE
        </div>
      </div>
      {/* Auth Modal for gating actions */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={login}
        onRegister={register}
        error={authError}
        isLoading={authLoading}
      />
    </div>
  );
};

export default PostDetail;
