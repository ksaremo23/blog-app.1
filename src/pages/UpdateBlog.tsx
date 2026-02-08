import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store/store';
import { fetchBlogById, editBlog, clearCurrentBlog } from '../store/slices/blogSlice';
import { uploadBlogImage } from '../services/storageService';
import Layout from '../components/Layout';
import './UpdateBlog.css';

const UpdateBlog = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { id } = useParams<{ id: string }>();
  const { currentBlog, isLoading, error } = useSelector(
    (state: RootState) => state.blog
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [validationError, setValidationError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
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
      if (user.id !== currentBlog.user_id) {
        navigate('/');
        return;
      }
      setTitle(currentBlog.title);
      setContent(currentBlog.content);
      if (currentBlog.image_url) setImagePreview(currentBlog.image_url);
      initializedRef.current = true;
    }
  }, [currentBlog, user, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setRemoveCurrentImage(false);
      if (imagePreview && !imagePreview.startsWith('http')) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setRemoveCurrentImage(true);
    if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
      let image_url: string | null = null;
      if (imageFile) {
        image_url = await uploadBlogImage(imageFile);
      } else if (removeCurrentImage) {
        image_url = null;
      } else if (currentBlog?.image_url) {
        image_url = currentBlog.image_url;
      }
      await dispatch(
        editBlog({
          id,
          blogData: { title: title.trim(), content: content.trim(), image_url },
        })
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
            <div className="form-group">
              <label>Post image (optional)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="form-file"
              />
              {(imagePreview || (currentBlog?.image_url && !removeCurrentImage)) && (
                <div className="image-preview-wrap">
                  <img
                    src={imagePreview || currentBlog?.image_url || ''}
                    alt="Preview"
                    className="image-preview"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="remove-image-btn"
                  >
                    Remove image
                  </button>
                </div>
              )}
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
