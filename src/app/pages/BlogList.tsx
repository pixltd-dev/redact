import { useEffect, useState } from 'react';
import { fetchPosts } from '../backend/api';
import { BlogPost } from '../model/BlogPostModel';

const BlogList = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetchPosts().then(setPosts);
  }, []);

  return (
    <div className="blog-list">
      <div className="post-list">
        {posts.map((post) => (
          <div key={post.id} className="post-item">
            <a href={`/post/${post.id}`} className="post-title">
              {post.title}
            </a>
            <a href={`/edit/${post.id}`} className="edit-link">
              ✏️ Edit
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogList;
