import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} from '../../services/authService';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

// Async thunks

// 1. Registration
//  -> User enters email/password
//  -> Sends to server (`registerUser`)
//  -> Returns user data (or null if failed)
export const register = createAsyncThunk(
  'auth/register', // Action name
  async ({ email, password }: { email: string; password: string }) => {
    const data = await registerUser(email, password); // Send signup request to server
    return data.user ? { // Return cleaned-up user data
      id: data.user.id,
      email: data.user.email || '',
      created_at: data.user.created_at,
    } : null;
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const data = await loginUser(email, password); // Send loginrequest to server
    return {  // Extract and return user data
      id: data.user!.id,  // '!' means we're sure it exists
      email: data.user!.email || '',
      created_at: data.user!.created_at,
    };
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await logoutUser(); // Tell server we're logging out
});

export const checkAuth = createAsyncThunk('auth/checkAuth', async () => {
  return await getCurrentUser();  // "Hey server, am I logged in?"
});

const authSlice = createSlice({
  name: 'auth', // This slice is named "auth"
  initialState, // Start with our empty box
  reducers: { // Simple actions (no API calls)
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;  // Manually set user data
    },
    clearError: (state) => {
      state.error = null; // Clear any error messages
    },
  },
   // extraReducers allows createSlice to respond and update its own state in response to other action types besides the types it has generated.
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;  // Show loading spinner
        state.error = null; // Clear any error messages
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false; // Hide loading spinner
        state.user = action.payload; // Store user data
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false; // Hide loading spinner
        state.error = action.error.message || 'Registration failed';  // Show error message
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Logout failed';
      });

    // Check Auth
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
      });
  },
});

export const { setUser, clearError } = authSlice.actions; // Makes setUser() and clearError() available to components
export default authSlice.reducer;
