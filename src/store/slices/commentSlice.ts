import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Comment, CommentFormData } from '../../types';
import { getComments, addComment } from '../../services/commentService';

interface CommentState {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CommentState = {
  comments: [],
  isLoading: false,
  error: null,
};

export const fetchComments = createAsyncThunk(
  'comment/fetchComments',
  async (blogId: string) => {
    return await getComments(blogId);
  }
);

export const addCommentThunk = createAsyncThunk(
  'comment/addComment',
  async ({ blogId, formData }: { blogId: string; formData: CommentFormData }) => {
    return await addComment(blogId, formData);
  }
);

const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    clearComments: (state) => {
      state.comments = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comments = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch comments';
      })
      .addCase(addCommentThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addCommentThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comments.push(action.payload);
      })
      .addCase(addCommentThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to add comment';
      });
  },
});

export const { clearComments, clearError } = commentSlice.actions;
export default commentSlice.reducer;
