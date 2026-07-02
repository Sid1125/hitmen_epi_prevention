import React from 'react';
import { PostSummary } from '../services/forumApi';

interface PostItemProps {
  post: PostSummary;
  onClick?: () => void;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const PostItem: React.FC<PostItemProps> = ({ 
  post, 
  onClick, 
  showActions = false, 
  onEdit, 
  onDelete 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div 
      className={`bg-white border border-gray-200 rounded-lg p-4 transition-shadow ${
        onClick ? 'hover:shadow-md cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
          {post.title}
        </h3>
        {showActions && (
          <div className="flex space-x-2 ml-4">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
      
      <p className="text-gray-600 mb-3 leading-relaxed">
        {truncateContent(post.content)}
      </p>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            {post.comment_count} comments
          </span>
          
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            {post.like_count} likes
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span>by <a href={`/intel/user/${post.author.username}`} className="text-blue-600 hover:underline">{post.author.username}</a></span>
          <span>•</span>
          <span>{formatDate(post.created_at)}</span>
          {post.updated_at !== post.created_at && (
            <>
              <span>•</span>
              <span className="text-blue-600">edited</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostItem;
