import { useEffect, useState } from 'react';
import { fetchPosts, fetchPostsByCategory } from '../backend/api';
import { BlogPost } from '../model/BlogPostModel';
import { useParams } from 'react-router-dom';

const BlogList = () => {
  const { category } = useParams<{ category: string }>();
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    // Fetch posts based on the category if provided
    if (category) {
      fetchPostsByCategory(category).then(setPosts);
    }
    // Otherwise, fetch all posts
    else fetchPosts().then(setPosts);
  }, []);

  const getExcerpt = (htmlContent: string) => {
    // Strip HTML tags and generate a short excerpt
    const textContent = htmlContent.replace(/<[^>]+>/g, ''); // Remove HTML tags
    return textContent.length > 100
      ? textContent.slice(0, 100) + '...'
      : textContent;
  };

  return (
    <div className="blog-list">
      <div className="post-list">
        {posts.map((post) => (
          <div key={post.id} className="post-item">
            <div className="post-content">
              <a href={`/post/${post.id}`} className="post-title">
                {post.title}
              </a>
              <p className="post-excerpt">{getExcerpt(post.content)}</p>
              <p className="post-date">
                Published on{' '}
                {new Date(post.created_at || '').toLocaleDateString()}
              </p>
              {post.tags.length > 0 && (
                <div className="post-tags">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="post-tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="post-actions">
              <a href={`/edit/${post.id}`} className="edit-link">
                ✏️ Edit
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogList;
