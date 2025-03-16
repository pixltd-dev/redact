import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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

  if (!post) return <p>Loading...</p>;

  return (
    <div>
      <h2>{post.title}</h2>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      <p>
        <strong>Tags:</strong>{' '}
        {post.tags.length > 0 ? post.tags.join(', ') : 'No tags'}
      </p>
      <Link to="/">⬅ Back to Blog List</Link>
    </div>
  );
};

export default BlogPostPage;
