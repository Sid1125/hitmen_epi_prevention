import React, { useState } from 'react';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import { CreatePostData } from '../../services/forumApi';

interface CreatePostProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePostData) => Promise<void>;
  isLoading?: boolean;
}

const CreatePost: React.FC<CreatePostProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      setFormData({ title: '', content: '', tags: [] });
      setTagInput('');
      onClose();
    } catch (err) {
      // Error handled by parent
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-accent/30 p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl font-mono text-accent mb-2">
            CREATE INTELLIGENCE REPORT
          </h2>
          <div className="h-px w-16 bg-accent mx-auto opacity-60" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-mono text-muted-foreground mb-1">
              TITLE
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 rounded edit-input font-mono text-sm focus:outline-none"
              placeholder="Enter report title..."
              required
              maxLength={255}
            />
          </div>

          <div>
            <label className="block text-sm font-mono text-muted-foreground mb-1">
              CONTENT
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-4 py-2 rounded edit-textarea font-mono text-sm focus:outline-none h-32"
              placeholder="Enter detailed intelligence report..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-mono text-muted-foreground mb-1">
              TAGS
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                className="flex-1 px-4 py-2 rounded edit-input font-mono text-sm focus:outline-none"
                placeholder="Add tags..."
                maxLength={50}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 border border-accent text-accent hover:bg-accent hover:text-background transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-1 bg-accent/10 border border-accent/30 px-2 py-1 text-xs font-mono"
                  >
                    <TagIcon className="w-3 h-3" />
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-muted-foreground hover:text-foreground ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 bg-accent text-background font-mono text-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? 'SUBMITTING...' : 'SUBMIT REPORT'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-border font-mono text-sm hover:bg-border/10 transition"
            >
              CANCEL
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground font-mono text-center">
          CLASSIFIED REPORT • HANDLE WITH CARE
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
