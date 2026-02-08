import { Link } from 'react-router-dom';
import type { Blog } from '../types';
import './BlogCard.css';

interface BlogCardProps {
  blog: Blog;
}

const BlogCard = ({ blog }: BlogCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="blog-card">
      <Link to={`/blog/${blog.id}`} className="blog-card-link">
        {blog.image_url && (
          <div className="blog-card-image-wrap">
            <img src={blog.image_url} alt="" className="blog-card-image" />
          </div>
        )}
        <h2 className="blog-card-title">{blog.title}</h2>
        <p className="blog-card-content">{truncateContent(blog.content)}</p>
        <div className="blog-card-footer">
          <span className="blog-card-date">{formatDate(blog.created_at)}</span>
        </div>
      </Link>
    </div>
  );
};

export default BlogCard;
