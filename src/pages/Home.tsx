import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';
import { fetchBlogs, setCurrentPage } from '../store/slices/blogSlice';
import Layout from '../components/Layout';
import BlogCard from '../components/BlogCard';
import Pagination from '../components/Pagination';
import './Home.css';

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { blogs, isLoading, error, totalCount, currentPage, pageSize } =
    useSelector((state: RootState) => state.blog);

  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    dispatch(fetchBlogs({ page: currentPage, pageSize }));
  }, [dispatch, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
    dispatch(fetchBlogs({ page, pageSize }));
  };

  return (
    <Layout>
      <div className="home-container">
        <div className="home-header">
          <h1>All Blogs</h1>
          <p className="blog-count">
            {totalCount} {totalCount === 1 ? 'blog' : 'blogs'} found
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {isLoading ? (
          <div className="loading">Loading blogs...</div>
        ) : blogs.length === 0 ? (
          <div className="no-blogs">
            <p>No blogs found. Be the first to create one!</p>
          </div>
        ) : (
          <>
            <div className="blogs-grid">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Home;
