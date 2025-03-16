import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPost, fetchPostById } from '../backend/api';
import { BlogPost } from '../model/BlogPostModel';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const BlogEditorPage = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (id) {
      fetchPostById(id).then((post) => {
        if (post) {
          setTitle(post.title);
          setContent(post.content);
          // Convert tags to a proper format
          setTags(post.tags?.join(', '));
        }
      });
    }
  }, [id]);

  const handleSave = async () => {
    const postData: Omit<BlogPost, 'id'> = {
      title,
      content,
      tags: tags.split(',').map((t) => t.trim()), // Convert string to array before saving
    };

    await createPost(postData);
    navigate('/');
  };

  return (
    <div>
      <h2>{id ? 'Edit Post' : 'New Post'}</h2>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <ReactQuill value={content} onChange={setContent} />
      <input
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags (comma-separated)"
      />
      <button onClick={handleSave}>💾 Save</button>
      <button onClick={() => navigate('/')}>Cancel</button>
    </div>
  );
};

export default BlogEditorPage;
