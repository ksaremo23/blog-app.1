import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store/store';
import { checkAuth, setUser } from './store/slices/authSlice';
import { onAuthStateChange } from './services/authService';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateBlog from './pages/CreateBlog';
import ViewBlog from './pages/ViewBlog';
import UpdateBlog from './pages/UpdateBlog';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Check auth on mount
    dispatch(checkAuth());

    // Listen to auth changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      dispatch(setUser(user));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <Register />}
        />
        <Route
          path="/create"
          element={user ? <CreateBlog /> : <Navigate to="/login" replace />}
        />
        <Route path="/blog/:id" element={<ViewBlog />} />
        <Route
          path="/blog/:id/edit"
          element={user ? <UpdateBlog /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;