import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPost, fetchPostById } from '../backend/api';
import { BlogPost } from '../model/BlogPostModel';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill's default styling

const BlogEditorPage = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const modules = {
    toolbar: [
      [{ header: '1' }, { header: '2' }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      // Enable image support
      ['image'],
      ['clean'],
    ],
  };

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'image',
  ];

  useEffect(() => {
    if (id) {
      // Fetch the post if an ID is provided (edit mode)
      fetchPostById(id).then((post) => {
        if (post) {
          setTitle(post.title);
          setContent(post.content);
          setTags(post.tags?.join(', '));
        }
      });
    }
  }, [id]);

  const handleSave = async () => {
    const postData: Omit<BlogPost, 'id'> = {
      title,
      content,
      tags: tags.split(',').map((t) => t.trim()),
    };

    if (id) {
      // Update existing post
      await createPost({ ...postData, id } as BlogPost); // Assuming `createPost` handles both create and update
    } else {
      // Create new post
      await createPost(postData);
    }

    navigate('/'); // Redirect to the blog list after saving
  };

  return (
    <div className="blog-editor">
      <h2 className="editor-title">{id ? 'Edit Post' : 'New Post'}</h2>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="editor-input"
      />
      <ReactQuill
        value={content}
        onChange={setContent}
        placeholder="Your amazing post goes here..."
        className="editor-quill"
        modules={modules}
        formats={formats}
      />
      <input
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags (comma-separated)"
        className="editor-input"
      />
      <div className="editor-buttons">
        <button onClick={handleSave} className="save-button">
          💾 Save
        </button>
        <button onClick={() => navigate(-1)} className="cancel-button">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BlogEditorPage;
