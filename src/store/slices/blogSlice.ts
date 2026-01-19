import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Blog, BlogFormData } from '../../types';
import {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from '../../services/blogService';

interface BlogState {
  blogs: Blog[];
  currentBlog: Blog | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

const initialState: BlogState = {
  blogs: [],
  currentBlog: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
};

// Async thunks
export const fetchBlogs = createAsyncThunk(
  'blog/fetchBlogs',
  async ({ page, pageSize }: { page: number; pageSize: number }) => {
    const result = await getBlogs(page, pageSize);
    return { blogs: result.blogs, totalCount: result.totalCount, page };
  }
);

export const fetchBlogById = createAsyncThunk(
  'blog/fetchBlogById',
  async (id: string) => {
    return await getBlogById(id);
  }
);

export const addBlog = createAsyncThunk(
  'blog/addBlog',
  async (blogData: BlogFormData) => {
    return await createBlog(blogData);
  }
);

export const editBlog = createAsyncThunk(
  'blog/editBlog',
  async ({ id, blogData }: { id: string; blogData: BlogFormData }) => {
    return await updateBlog(id, blogData);
  }
);

export const removeBlog = createAsyncThunk(
  'blog/removeBlog',
  async (id: string) => {
    await deleteBlog(id);
    return id;
  }
);

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearCurrentBlog: (state) => {
      state.currentBlog = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Blogs
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blogs = action.payload.blogs;
        state.totalCount = action.payload.totalCount;
        state.currentPage = action.payload.page;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch blogs';
      });

    // Fetch Blog By ID
    builder
      .addCase(fetchBlogById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBlog = action.payload;
      })
      .addCase(fetchBlogById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch blog';
      });

    // Add Blog
    builder
      .addCase(addBlog.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addBlog.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blogs.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(addBlog.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create blog';
      });

    // Edit Blog
    builder
      .addCase(editBlog.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(editBlog.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.blogs.findIndex(
          (blog) => blog.id === action.payload.id
        );
        if (index !== -1) {
          state.blogs[index] = action.payload;
        }
        if (state.currentBlog?.id === action.payload.id) {
          state.currentBlog = action.payload;
        }
      })
      .addCase(editBlog.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update blog';
      });

    // Remove Blog
    builder
      .addCase(removeBlog.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeBlog.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blogs = state.blogs.filter((blog) => blog.id !== action.payload);
        state.totalCount -= 1;
        if (state.currentBlog?.id === action.payload) {
          state.currentBlog = null;
        }
      })
      .addCase(removeBlog.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete blog';
      });
  },
});

export const { setCurrentPage, clearCurrentBlog, clearError } =
  blogSlice.actions;
export default blogSlice.reducer;
