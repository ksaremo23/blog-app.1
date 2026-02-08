import { useEffect } from 'react'; // useEffect is a React hook that lets us perform side effects (like fetching data, setting up subscriptions) after the component renders.
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; 
import { useDispatch, useSelector } from 'react-redux'; // useDispatch: Lets us send actions to Redux store (like sending commands) // useSelector: - Lets us read data from Redux store (like reading from a global notebook)
import type { AppDispatch, RootState } from './store/store'; // TypeScript types for our Redux store (helps TypeScript understand what data looks like)
import { checkAuth, setUser } from './store/slices/authSlice'; // - Action creators from our auth slice: *** checkAuth(): Checks if user is logged in *** setUser(): Updates user data in Redux
import { onAuthStateChange } from './services/authService'; // A service function that listens for authentication state changes (like when user logs in/out)
//Importing all our page components (like loading different rooms of a house)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateBlog from './pages/CreateBlog';
import ViewBlog from './pages/ViewBlog';
import UpdateBlog from './pages/UpdateBlog';

function App() {
  const dispatch = useDispatch<AppDispatch>(); // - Creates a `dispatch` function to send actions to Redux store // <AppDispatch> is a TypeScript type for type safety 
  const { user } = useSelector((state: RootState) => state.auth); 

  // inform redux when user logs in/out
  useEffect(() => { // This code runs AFTER the component renders
    // Check auth on mount
    dispatch(checkAuth()); // 1. Check if user is already logged in (from localStorage/tokens)

    // Listen to auth changes
    const { data: { subscription } } = onAuthStateChange((user) => { // Sets up a listener that watches for login/logout events
      dispatch(setUser(user)); // When auth state changes (user logs in/out), it updates Redux store
    });

    return () => {
      subscription.unsubscribe(); // 3. Cleanup when component unmounts
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