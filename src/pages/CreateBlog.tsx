import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store/store';
import { addBlog } from '../store/slices/blogSlice';
import Layout from '../components/Layout';
import './CreateBlog.css';

const CreateBlog = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.blog);
  const { user } = useSelector((state: RootState) => state.auth);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [validationError, setValidationError] = useState('');

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

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

    try {
      await dispatch(addBlog({ title: title.trim(), content: content.trim() })).unwrap();
      navigate('/');
    } catch {
      // Error is handled by Redux
    }
  };

  return (
    <Layout>
      <div className="create-blog-container">
        <div className="create-blog-card">
          <h1>Create New Blog</h1>
          <form onSubmit={handleSubmit} className="create-blog-form">
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
                onClick={() => navigate('/')}
                className="cancel-button"
              >
                Cancel
              </button>
              <button type="submit" disabled={isLoading} className="submit-button">
                {isLoading ? 'Creating...' : 'Create Blog'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateBlog;
