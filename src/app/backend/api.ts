import { BlogPost } from '../model/BlogPostModel';
import { UserSettings } from '../model/UserSettings';
import { setUserSettings } from '../utils/DataHolder';

const API_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8001/backend'
    : './backend';

export const checkAndSetupDatabase = async (): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/setup_db.php`);
    const text = await response.text();
    console.log('Database Setup: ', text);
  } catch (error) {
    console.error('Error setting up database:', error);
  }
};

export const fetchPosts = async (): Promise<BlogPost[]> => {
  try {
    const response = await fetch(`${API_BASE}/posts.php`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    const posts: BlogPost[] = await response.json();

    return posts.map((post) => ({
      ...post,
      tags:
        typeof post.tags === 'string'
          ? (post.tags as string).split(',').map((t) => t.trim())
          : [],
    }));
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

export const fetchPostById = async (id: string): Promise<BlogPost | null> => {
  try {
    const response = await fetch(`${API_BASE}/posts.php?id=${id}`);
    if (!response.ok) throw new Error('Post not found');
    const post: BlogPost = await response.json();

    return {
      ...post,
      tags:
        typeof post.tags === 'string'
          ? (post.tags as string).split(',').map((t) => t.trim())
          : [],
    };
  } catch (error) {
    console.error(`Error fetching post ${id}:`, error);
    return null;
  }
};

export const createPost = async (
  post: Omit<BlogPost, 'id'>
): Promise<string | null> => {
  try {
    const response = await fetch(`${API_BASE}/posts.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });

    const data = await response.json();
    if (data.success) return data.id;
    throw new Error(data.error || 'Failed to create post');
  } catch (error) {
    console.error('Error creating post:', error);
    return null;
  }
};

export const fetchUserSettings = async (): Promise<UserSettings | null> => {
  try {
    const response = await fetch(`${API_BASE}/user_settings.php`, {
      method: 'GET',
    });
    if (!response.ok) throw new Error('Failed to fetch user settings');
    const settings: UserSettings = await response.json();
    setUserSettings(settings);
    return settings;
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return null;
  }
};

export const updateUserSettings = async (
  settings: UserSettings
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/user_settings.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    const data = await response.json();
    if (data.success) return true;
    throw new Error(data.error || 'Failed to update user settings');
  } catch (error) {
    console.error('Error updating user settings:', error);
    return false;
  }
};
