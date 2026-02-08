import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store/store';
import { fetchBlogById, removeBlog, clearCurrentBlog } from '../store/slices/blogSlice';
import { fetchComments, addCommentThunk, clearComments } from '../store/slices/commentSlice';
import { uploadCommentImage } from '../services/storageService';
import Layout from '../components/Layout';
import './ViewBlog.css';

const ViewBlog = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const commentImageRef = useRef<HTMLInputElement>(null);
  const { id } = useParams<{ id: string }>();
  const { currentBlog, isLoading, error } = useSelector(
    (state: RootState) => state.blog
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const { comments, isLoading: commentsLoading, error: commentError } = useSelector(
    (state: RootState) => state.comment
  );

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [commentImageFile, setCommentImageFile] = useState<File | null>(null);
  const [commentImagePreview, setCommentImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchBlogById(id));
      dispatch(fetchComments(id));
    }

    return () => {
      dispatch(clearCurrentBlog());
      dispatch(clearComments());
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

  const handleCommentImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCommentImageFile(file);
      setCommentImagePreview(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  const handleRemoveCommentImage = () => {
    setCommentImageFile(null);
    if (commentImagePreview) URL.revokeObjectURL(commentImagePreview);
    setCommentImagePreview(null);
    if (commentImageRef.current) commentImageRef.current.value = '';
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !commentContent.trim()) return;
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      let image_url: string | null = null;
      if (commentImageFile) {
        image_url = await uploadCommentImage(commentImageFile);
      }
      await dispatch(
        addCommentThunk({
          blogId: id,
          formData: { content: commentContent.trim(), image_url },
        })
      ).unwrap();
      setCommentContent('');
      handleRemoveCommentImage();
    } catch {
      // Error in Redux
    }
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
          {currentBlog.image_url && (
            <div className="blog-image-wrap">
              <img
                src={currentBlog.image_url}
                alt=""
                className="blog-image"
              />
            </div>
          )}
          <div className="blog-content">{currentBlog.content}</div>

          <section className="comments-section">
            <h2 className="comments-title">Comments ({comments.length})</h2>
            {user && (
              <form onSubmit={handleSubmitComment} className="comment-form">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  className="comment-input"
                  required
                />
                <div className="comment-form-actions">
                  <input
                    ref={commentImageRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCommentImageChange}
                    className="comment-file-input"
                  />
                  {commentImagePreview && (
                    <div className="comment-image-preview-wrap">
                      <img src={commentImagePreview} alt="" className="comment-image-preview" />
                      <button type="button" onClick={handleRemoveCommentImage} className="remove-comment-image-btn">
                        Remove
                      </button>
                    </div>
                  )}
                  <button type="submit" disabled={commentsLoading} className="comment-submit-btn">
                    {commentsLoading ? 'Posting...' : 'Comment'}
                  </button>
                </div>
              </form>
            )}
            {!user && (
              <p className="comments-login-hint">
                <Link to="/login">Log in</Link> to leave a comment.
              </p>
            )}
            {commentError && <div className="error-message">{commentError}</div>}
            {commentsLoading && !comments.length ? (
              <p className="comments-loading">Loading comments...</p>
            ) : (
              <ul className="comments-list">
                {comments.map((c) => (
                  <li key={c.id} className="comment-item">
                    <div className="comment-body">{c.content}</div>
                    {c.image_url && (
                      <div className="comment-image-wrap">
                        <img src={c.image_url} alt="" className="comment-image" />
                      </div>
                    )}
                    <span className="comment-date">{formatDate(c.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

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
