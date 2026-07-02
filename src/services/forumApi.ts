// Forum API service for connecting to the HITMEN forum backend

// Use '/api' as the base URL for all API requests (reverse proxy setup)
const getApiBaseUrl = () => {
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'alpha' | 'delta';
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: 'alpha' | 'delta';
  created_at: string;
  is_active: boolean;
  post_count: number;
  comment_count: number;
}

export interface UserProfilePublic {
  id: number;
  username: string;
  created_at: string;
  is_active: boolean;
  post_count: number;
  comment_count: number;
}

export interface UserProfileUpdate {
  username?: string;
  email?: string;
}

export interface PostAuthor {
  id: number;
  username: string;
}

export interface PostSummary {
  id: number;
  title: string;
  created_at: string;
  updated_at?: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  like_count: number;
  dislike_count: number;
  author: PostAuthor;
  comment_count: number;
  tags: string[];
}

export interface Comment {
  id: number;
  content: string;
  created_at: string;
  updated_at?: string;
  is_deleted: boolean;
  post_id: number;
  author_id: number;
  parent_id?: number;
  like_count: number;
  dislike_count: number;
  author: PostAuthor;
  replies: Comment[];
}

export interface Post {
  id: number;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at?: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  like_count: number;
  dislike_count: number;
  author_id: number;
  author: PostAuthor;
  comments: Comment[];
}

export interface CreatePostData {
  title: string;
  content: string;
  tags: string[];
}

export interface CreateCommentData {
  content: string;
  post_id: number;
  parent_id?: number;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

class ForumAPI {
  private getHeaders(includeAuth = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('forum_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        detail: response.status === 0 ? 'Cannot connect to server' : 'Network error' 
      }));
      throw new Error(error.detail || `Server error: ${response.status}`);
    }
    return response.json();
  }

  // Authentication
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      
      const result = await this.handleResponse<AuthResponse>(response);
      localStorage.setItem('forum_token', result.access_token);
      return result;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  }

  async register(data: RegisterData): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      
      return this.handleResponse<User>(response);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('forum_token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('forum_token');
  }

  // Posts
  async getPosts(params?: {
    skip?: number;
    limit?: number;
    search?: string;
    tag?: string;
  }): Promise<PostSummary[]> {
    let url = `${API_BASE_URL}/posts`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
      if (Array.from(searchParams).length > 0) {
        url += `?${searchParams.toString()}`;
      }
    }
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<PostSummary[]>(response);
  }

  async getPost(id: number): Promise<Post> {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<Post>(response);
  }

  async createPost(data: CreatePostData): Promise<Post> {
    // Use no trailing slash to match backend route
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<Post>(response);
  }

  async updatePost(id: number, data: Partial<CreatePostData>): Promise<Post> {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<Post>(response);
  }

  async deletePost(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  }

  // User Profiles
  async getCurrentUserProfile(): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<UserProfile>(response);
  }

  async getUserProfile(id: number): Promise<UserProfilePublic> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<UserProfilePublic>(response);
  }

  async getUserProfileByUsername(username: string): Promise<UserProfilePublic> {
    const response = await fetch(`${API_BASE_URL}/users/user/${username}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<UserProfilePublic>(response);
  }

  async updateCurrentUserProfile(data: UserProfileUpdate): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/users/me/profile`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<UserProfile>(response);
  }

  async getUserPosts(userId: number, params?: { skip?: number; limit?: number }): Promise<PostSummary[]> {
    let url = `${API_BASE_URL}/users/${userId}/posts`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
      if (Array.from(searchParams).length > 0) {
        url += `?${searchParams.toString()}`;
      }
    }
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<PostSummary[]>(response);
  }

  // Comments
  async getCommentsByPost(postId: number): Promise<Comment[]> {
    // Use no trailing slash for GET
    const response = await fetch(`${API_BASE_URL}/comments/post/${postId}`, {
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<Comment[]>(response);
  }

  // Create a comment
  async createComment(data: { post_id: number; content: string; parent_id?: number }): Promise<Comment> {
    // Use trailing slash for POST to match backend
    const response = await fetch(`${API_BASE_URL}/comments/`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Comment>(response);
  }

  async updateComment(id: number, content: string): Promise<Comment> {
    const response = await fetch(`${API_BASE_URL}/comments/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify({ content }),
    });
    
    return this.handleResponse<Comment>(response);
  }

  async deleteComment(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/comments/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  }

  // Like a post
  async likePost(postId: number): Promise<{ like_count: number }> {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<{ like_count: number }>(response);
  }

  // Dislike a post
  async dislikePost(postId: number): Promise<{ dislike_count: number }> {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/dislike`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<{ dislike_count: number }>(response);
  }

  // Like a comment
  async likeComment(commentId: number): Promise<{ like_count: number }> {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}/like`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<{ like_count: number }>(response);
  }

  // Dislike a comment
  async dislikeComment(commentId: number): Promise<{ dislike_count: number }> {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}/dislike`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<{ dislike_count: number }>(response);
  }

  // Admin Functions
  async getAllUsers(params?: { skip?: number; limit?: number }): Promise<UserProfile[]> {
    let url = `${API_BASE_URL}/users/admin/all`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
      if (Array.from(searchParams).length > 0) {
        url += `?${searchParams.toString()}`;
      }
    }
    const response = await fetch(url, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<UserProfile[]>(response);
  }

  async updateUserRole(userId: number, role: 'alpha' | 'delta'): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify({ role }),
    });
    return this.handleResponse<UserProfile>(response);
  }

  // Admin delete user account
  async deleteUserAccount(userId: number): Promise<{ message: string }> {
    // Try multiple endpoint patterns that might exist
    const endpoints = [
      `${API_BASE_URL}/users/admin/${userId}`,      // /users/admin/{id}
      `${API_BASE_URL}/users/${userId}/admin-delete`, // /users/{id}/admin-delete  
      `${API_BASE_URL}/users/${userId}/delete`,     // /users/{id}/delete
      `${API_BASE_URL}/users/${userId}`,            // /users/{id} (simple DELETE)
      `${API_BASE_URL}/admin/users/${userId}`,      // /admin/users/{id}
    ];

    let lastError: Error | null = null;
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'DELETE',
          headers: this.getHeaders(true),
        });
        
        if (response.ok) {
          // If successful, return the response
          try {
            return await response.json();
          } catch {
            // If no JSON response, return a success message
            return { message: 'User account deleted successfully' };
          }
        } else if (response.status !== 404 && response.status !== 405) {
          // If not a "not found" or "method not allowed" error, handle it
          const error = await response.json().catch(() => ({ 
            detail: `Server error: ${response.status}` 
          }));
          throw new Error(error.detail || `Server error: ${response.status}`);
        }
      } catch (error) {
        lastError = error as Error;
        // Continue to next endpoint if this one fails with 404/405
        continue;
      }
    }
    
    // If all endpoints failed, throw the last error
    throw new Error(lastError?.message || 'Admin delete endpoint not found. This feature may not be implemented on the backend.');
  }

  // Change password
  async changePassword(data: { current_password: string; new_password: string }): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/users/me/change-password`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  // Delete account
  async deleteAccount(): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/users/me/account`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    const result = await this.handleResponse<{ message: string }>(response);
    // Clear token after successful account deletion
    this.logout();
    return result;
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return this.handleResponse<{ status: string }>(response);
  }

  // Debug function to test what endpoints are available
  async testDeleteEndpoints(userId: number): Promise<string[]> {
    const endpoints = [
      `${API_BASE_URL}/users/admin/${userId}`,
      `${API_BASE_URL}/users/${userId}/admin-delete`,
      `${API_BASE_URL}/users/${userId}/delete`,
      `${API_BASE_URL}/users/${userId}`,
      `${API_BASE_URL}/admin/users/${userId}`,
    ];

    const results: string[] = [];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'OPTIONS', // Safe method to test endpoint availability
          headers: this.getHeaders(true),
        });
        results.push(`${endpoint}: ${response.status} ${response.statusText}`);
      } catch (error) {
        results.push(`${endpoint}: ERROR - ${error}`);
      }
    }
    
    return results;
  }
}

export const forumApi = new ForumAPI();
