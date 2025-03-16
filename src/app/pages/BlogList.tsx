import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPosts } from '../backend/api';
import { BlogPost } from '../model/BlogPostModel';

const BlogList = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetchPosts().then(setPosts);
  }, []);

  return (
    <div>
      <h2>Blog Posts</h2>
      <button>
        <Link to="/new">➕ Add New Post</Link>
      </button>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <Link to={`/post/${post.id}`}>{post.title}</Link>
            <Link to={`/edit/${post.id}`} style={{ marginLeft: '10px' }}>
              ✏️ Edit
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlogList;
