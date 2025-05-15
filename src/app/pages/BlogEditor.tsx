import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPost, fetchCategories, fetchPostById } from '../backend/api';
import { BlogPost } from '../model/BlogPostModel';
import ReactQuill, { Quill } from 'react-quill';
import { ImageActions } from '@xeger/quill-image-actions';
import { ImageFormats } from '@xeger/quill-image-formats';
import { Category } from '../model/Category';
import ImageResize from '../utils/ImageResize';

Quill.register('modules/imageActions', ImageActions);
Quill.register('modules/imageFormats', ImageFormats);
Quill.register('modules/imageResize', ImageResize);

const BlogEditorPage = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [requestInProgress, setRequestInProgress] = useState(false);

  const modules = {
    // imageActions: {},
    imageFormats: {},
    imageResize: {},
    toolbar: [
      [{ header: '1' }, { header: '2' }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      // Enable image support
      ['image'],
      ['clean'],
      [{ align: [] }],
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
    'align',
    'float',
  ];

  useEffect(() => {
    if (id) {
      // Fetch the post if an ID is provided (edit mode)
      fetchPostById(id).then((post) => {
        if (post) {
          setTitle(post.title);
          setContent(post.content);
          setTags(post.tags?.join(', '));
          setCategoryId(post.categoryID ?? null);
        }
      });
    }
  }, [id]);

  useEffect(() => {
    (async () => {
      const fetchedCategories = await fetchCategories();
      if (fetchedCategories) {
        setCategories(fetchedCategories);
      }
    })();
  }, []);

  const handleSave = async () => {
    setRequestInProgress(true);
    const postData: Omit<BlogPost, 'id'> = {
      title,
      content,
      tags: tags.split(',').map((t) => t.trim()),
      categoryID: categoryId ?? undefined,
    };

    if (id) {
      // Update existing post
      await createPost({ ...postData, id } as BlogPost); // Assuming `createPost` handles both create and update
    } else {
      // Create new post
      await createPost(postData);
    }
    setRequestInProgress(false);
    navigate('/'); // Redirect to the blog list after saving
  };

  return (
    <div className="blog-editor">
      {requestInProgress && (
        <div className="loading-overlay">
          <div className="loading-spinner">
          </div>
        </div>
      )}
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
      {/* <input
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags (comma-separated)"
        className="editor-input"
      /> */}
      <select
        value={categoryId ?? ''}
        onChange={(e) => setCategoryId(Number(e.target.value))}
        className="editor-select"
      >
        <option>-</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.title}
          </option>
        ))}
      </select>
      <div className="editor-buttons">
        <button onClick={handleSave} className="save-button" disabled={requestInProgress}>
          💾 Save
        </button>
        <button onClick={() => navigate(-1)} className="cancel-button" disabled={requestInProgress}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BlogEditorPage;
