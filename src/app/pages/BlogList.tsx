import { useEffect, useState } from 'react';
import { fetchPosts, fetchPostsByCategory } from '../backend/api';
import { BlogPost } from '../model/BlogPostModel';
import { useParams } from 'react-router-dom';
import BlogPostPage from './BlogPost';
import { useAuth } from '../hooks/useAuth';
import { useAppData } from '../utils/AppDataContext';

const BlogList = () => {
  const { category } = useParams<{ category: string }>();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  // const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const { isAuthenticated, isLoading } = useAuth();
  const { categories, userSettings } = useAppData();


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

  // const loadUserSettings = async () => {
  //   try {
  //     const settings = await getHolderUserSettings();
  //     setUserSettings(settings);
  //     console.log('User settings loaded:', settings);
  //   } catch (error) {
  //     console.error('Error loading user settings:', error);
  //   }
  // };

  useEffect(() => {
    // loadUserSettings();
  }, []);

  return userSettings?.showFullPosts ? (
    <div className="blog-list">
      <div className="post-list">
        {posts.map((post) => (
          <div key={post.id.toString()}>
            <BlogPostPage key={post.id} postParameter={post} />
            <div className="spacer-small"></div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="blog-list">
      <div className="post-list">
        {posts.map((post) => (
          <div key={post.id.toString()} className="post-item">
            <div className="post-content">
              <a href={`/post/${post.id}`} className="post-title">
                {post.title}
              </a>
              <p className="post-excerpt">{getExcerpt(post.content)}</p>
              <p className="post-date">
                Published on{' '}
                {new Date(post.created_at || '').toLocaleDateString()}
              </p>
              {/* {post.tags.length > 0 && (
                <div className="post-tags">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="post-tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              )} */}
            </div>
            {isAuthenticated && !isLoading && (
            <div className="post-actions">
              <a href={`/edit/${post.id}`} className="edit-link">
                ✏️ Edit
              </a>
            </div>)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogList;
