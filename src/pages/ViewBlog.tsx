import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store/store';
import { fetchBlogById, removeBlog, clearCurrentBlog } from '../store/slices/blogSlice';
import Layout from '../components/Layout';
import './ViewBlog.css';

const ViewBlog = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentBlog, isLoading, error } = useSelector(
    (state: RootState) => state.blog
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchBlogById(id));
    }

    return () => {
      dispatch(clearCurrentBlog());
    };
  }, [dispatch, id]);

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await dispatch(removeBlog(id)).unwrap();
      navigate('/');
    } catch {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading && !currentBlog) {
    return (
      <Layout>
        <div className="view-blog-container">
          <div className="loading">Loading blog...</div>
        </div>
      </Layout>
    );
  }

  if (error && !currentBlog) {
    return (
      <Layout>
        <div className="view-blog-container">
          <div className="error-message">{error}</div>
          <Link to="/" className="back-link">
            Back to Home
          </Link>
        </div>
      </Layout>
    );
  }

  if (!currentBlog) {
    return (
      <Layout>
        <div className="view-blog-container">
          <div className="error-message">Blog not found</div>
          <Link to="/" className="back-link">
            Back to Home
          </Link>
        </div>
      </Layout>
    );
  }

  const isOwner = user && user.id === currentBlog.user_id;

  return (
    <Layout>
      <div className="view-blog-container">
        <div className="view-blog-card">
          <div className="blog-header">
            <Link to="/" className="back-link">
              ← Back to Home
            </Link>
            {isOwner && (
              <div className="blog-actions">
                <Link to={`/blog/${id}/edit`} className="edit-button">
                  Edit
                </Link>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <h1 className="blog-title">{currentBlog.title}</h1>
          <div className="blog-meta">
            <span className="blog-date">
              Published: {formatDate(currentBlog.created_at)}
            </span>
            {currentBlog.updated_at !== currentBlog.created_at && (
              <span className="blog-date">
                Updated: {formatDate(currentBlog.updated_at)}
              </span>
            )}
          </div>
          <div className="blog-content">{currentBlog.content}</div>

          {showDeleteConfirm && (
            <div className="delete-confirm">
              <p>Are you sure you want to delete this blog?</p>
              <div className="delete-confirm-actions">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="cancel-button"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="delete-button"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ViewBlog;
