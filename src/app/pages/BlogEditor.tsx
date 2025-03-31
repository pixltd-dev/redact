import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPostById } from '../backend/api';
import { BlogPost } from '../model/BlogPostModel';

const BlogPostPage = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    if (id) {
      fetchPostById(id).then((data) => {
        if (data) {
          data.tags =
            typeof data.tags === 'string'
              ? (data.tags as string).split(',').map((t) => t.trim())
              : [];
          setPost(data);
        }
      });
    }
  }, [id]);

  if (!post) return <p className="loading">Loading...</p>;

  return (
    <div className="blog-post">
      <h2 className="post-title">{post.title}</h2>
      <div
        className="post-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      <p className="post-tags">
        <strong>Tags:</strong>{' '}
        {post.tags.length > 0 ? post.tags.join(', ') : 'No tags'}
      </p>
      <a href="/" className="back-link">
        ⬅ Back to Blog List
      </a>
    </div>
  );
};

export default BlogPostPage;
