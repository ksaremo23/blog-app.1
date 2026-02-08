// User and Authentication Types
export interface User {
  id: string;
  email: string;
  created_at?: string;
}

// Blog Types
export interface Blog {
  id: string;
  title: string;
  content: string;
  user_id: string;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogFormData {
  title: string;
  content: string;
  image_url?: string | null;
}

// Comment Types
export interface Comment {
  id: string;
  blog_id: string;
  user_id: string;
  content: string;
  image_url?: string | null;
  created_at: string;
}

export interface CommentFormData {
  content: string;
  image_url?: string | null;
}

// Auth State Types
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Blog State Types
export interface BlogState {
  blogs: Blog[];
  currentBlog: Blog | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
}
