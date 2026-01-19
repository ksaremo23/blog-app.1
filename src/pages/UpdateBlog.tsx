import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store/store';
import { fetchBlogById, editBlog, clearCurrentBlog } from '../store/slices/blogSlice';
import Layout from '../components/Layout';
import './UpdateBlog.css';

const UpdateBlog = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentBlog, isLoading, error } = useSelector(
    (state: RootState) => state.blog
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [validationError, setValidationError] = useState('');
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (id) {
      dispatch(fetchBlogById(id));
    }

    return () => {
      dispatch(clearCurrentBlog());
      initializedRef.current = false;
    };
  }, [dispatch, id, user, navigate]);

  useEffect(() => {
    if (currentBlog && user && !initializedRef.current) {
      // Check if user is the owner
      if (user.id !== currentBlog.user_id) {
        navigate('/');
        return;
      }
      // Initialize form fields when blog data is first loaded
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(currentBlog.title);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setContent(currentBlog.content);
      initializedRef.current = true;
    }
  }, [currentBlog, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!title.trim() || !content.trim()) {
      setValidationError('Please fill in all fields');
      return;
    }

    if (title.trim().length < 3) {
      setValidationError('Title must be at least 3 characters');
      return;
    }

    if (!id) return;

    try {
      await dispatch(
        editBlog({ id, blogData: { title: title.trim(), content: content.trim() } })
      ).unwrap();
      navigate(`/blog/${id}`);
    } catch {
      // Error is handled by Redux
    }
  };

  if (!user) {
    return null;
  }

  if (isLoading && !currentBlog) {
    return (
      <Layout>
        <div className="update-blog-container">
          <div className="loading">Loading blog...</div>
        </div>
      </Layout>
    );
  }

  if (!currentBlog) {
    return (
      <Layout>
        <div className="update-blog-container">
          <div className="error-message">Blog not found</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="update-blog-container">
        <div className="update-blog-card">
          <h1>Update Blog</h1>
          <form onSubmit={handleSubmit} className="update-blog-form">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter blog title"
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="content">Content</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your blog content here..."
                rows={15}
                disabled={isLoading}
              />
            </div>
            {(error || validationError) && (
              <div className="error-message">
                {validationError || error}
              </div>
            )}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate(`/blog/${id}`)}
                className="cancel-button"
              >
                Cancel
              </button>
              <button type="submit" disabled={isLoading} className="submit-button">
                {isLoading ? 'Updating...' : 'Update Blog'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default UpdateBlog;
