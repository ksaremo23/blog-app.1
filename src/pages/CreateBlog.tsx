import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store/store';
import { addBlog, clearError } from '../store/slices/blogSlice';
import { uploadBlogImage } from '../services/storageService';
import Layout from '../components/Layout';
import './CreateBlog.css';

const CreateBlog = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isLoading, error } = useSelector((state: RootState) => state.blog);
  const { user } = useSelector((state: RootState) => state.auth);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [validationError, setValidationError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    dispatch(clearError());

    if (!title.trim() || !content.trim()) {
      setValidationError('Please fill in all fields');
      return;
    }

    if (title.trim().length < 3) {
      setValidationError('Title must be at least 3 characters');
      return;
    }

    try {
      let image_url: string | null = null;
      if (imageFile) {
        try {
          image_url = await uploadBlogImage(imageFile);
        } catch (imgErr) {
          const msg = imgErr instanceof Error ? imgErr.message : 'Image upload failed';
          setValidationError(`${msg}. Create the "uploads" storage bucket in Supabase (see README) or remove the image and try again.`);
          return;
        }
      }
      await dispatch(
        addBlog({
          title: title.trim(),
          content: content.trim(),
          image_url,
        })
      ).unwrap();
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create blog';
      setValidationError(message);
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
            <div className="form-group">
              <label>Post image (optional)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="form-file"
              />
              {imagePreview && (
                <div className="image-preview-wrap">
                  <img src={imagePreview} alt="Preview" className="image-preview" />
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
