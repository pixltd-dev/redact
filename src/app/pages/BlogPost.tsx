import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPostById, deletePost } from '../backend/api';
import { BlogPost } from '../model/BlogPostModel';
import { useAuth } from '../hooks/useAuth';

interface BlogPostPageProps {
  postParameter?: BlogPost | undefined;
}

const BlogPostPage: React.FC<BlogPostPageProps> = ({ postParameter }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (postParameter) {
      setPost(postParameter);
    } else {
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
    }
  }, [id]);

  const handleDelete = async () => {
    if ((id || postParameter?.id) && window.confirm('Are you sure you want to delete this post?')) {
      const success = await deletePost((id ?? postParameter?.id) || '');
      if (success) {
        navigate(0); // Force reload to the main page
        alert('Post deleted successfully!');        
      } else {
        alert('Failed to delete the post.');
      }
    }
  };

  if (!post) return <p className="loading">Loading...</p>;

  return (
    <div className="blog-post">
      <h2 className="post-title">{post.title}</h2>
      <div
        className="post-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      {/* <p className="post-tags">
        <strong>Tags:</strong>{' '}
        {post.tags.length > 0 ? post.tags.join(', ') : 'No tags'}
      </p> */}
      <p className="post-date">
        <strong>Published on:</strong>{' '}
        {new Date(post.created_at ?? '').toLocaleDateString()}
      </p>
      {/* <p className="post-category">
        <strong>Category:</strong> {post.categoryID ?? 'Unknown'}
      </p> */}
      {isAuthenticated && !isLoading && (
      <div className="post-actions">
        <button
          className="edit-button"
          onClick={() => navigate(`/edit/${post.id}`)}
        >
          ✏️ Edit
        </button>
        <button className="delete-button" onClick={() => handleDelete()}>
          🗑️ Delete
        </button>
      </div>
      )}
      {!postParameter && (
        <div className="post-actions">
          <button
            onClick={() => {
              navigate(-1);
            }}
            className="back-link"
          >
            ⬅ Back
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogPostPage;
