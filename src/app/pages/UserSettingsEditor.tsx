import React, { useEffect, useState } from 'react';
import { UserSettings } from '../model/UserSettings';
import {
  checkAndSetupDatabase,
  createCategory,
  deleteCategory,
  fetchCategories,
  fetchUserSettings,
  updateUserSettings,
} from '../backend/api';
import { setHolderUserSettings } from '../utils/DataHolder';
import { Category } from '../model/Category';

const UserSettingsEditor: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [originalCategories, setOriginalCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const fetchedSettings = await fetchUserSettings();
        if (fetchedSettings) {
          setSettings(fetchedSettings);
        }
      } catch (err) {
        setError('Failed to load user settings.');
      } finally {
        setLoading(false);
      }
    };

    const loadCategories = async () => {
      try {
        const fetchedCategories = await fetchCategories();
        if (fetchedCategories) {
          setCategories(fetchedCategories);
          setOriginalCategories(fetchedCategories);
        }
      } catch (err) {
        setError('Failed to load categories.');
      }
    };

    loadSettings();
    loadCategories();
  }, []);

  const handleToggleShowTitle = () => {
    if (settings) {
      setSettings({ ...settings, showTitle: !settings.showTitle });
    }
  };

  const handleCheckDatabase = async () => {
    try {
      await checkAndSetupDatabase();
      alert('Database is set up correctly!');
    } catch (err) {
      setError('Failed to check database.');
    }
  };

  const handeUpdatedCategories = async () => {
    try {
      categories.map(async (category) => {
        await createCategory(category);
        const originalCategory = originalCategories.find(
          (original) => original.title === category.title
        );
        if (!originalCategory) {
          await deleteCategory(category);
        }
      });
    } catch (err) {
      setError('Failed to update categories.');
    }
  };

  const handleSave = async () => {
    handeUpdatedCategories();

    if (settings) {
      try {
        const success = await updateUserSettings(settings);
        if (success) {
          setHolderUserSettings(settings);
          window.location.reload();
          alert('Settings saved successfully!');
        } else {
          throw new Error('Failed to save settings.');
        }
      } catch (err) {
        setError('Failed to save user settings.');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!settings) {
    return <div className="no-settings">No settings available.</div>;
  }

  return (
    <div className="user-settings-editor">
      <button onClick={handleCheckDatabase} className="save-button">
        Check database
      </button>
      <button onClick={handleSave} className="save-button">
        Save
      </button>
      <h1 className="editor-title">User Settings</h1>
      <div className="settings-item">
        <label className="settings-label">
          <input
            type="checkbox"
            checked={settings.showTitle}
            onChange={handleToggleShowTitle}
            className="settings-checkbox"
          />
          Show Title
        </label>
      </div>
      <h1 className="editor-title">Categories</h1>
      <div className="settings-item">
        <div className="categories-list">
          {categories.map((category, index) => (
            <div key={category.id} className="category-item">
              <input
                type="text"
                value={category.title}
                onChange={(e) => {
                  const updatedCategories = [...categories];
                  updatedCategories[index] = {
                    ...category,
                    title: e.target.value,
                  };
                  setCategories(updatedCategories);
                }}
                className="category-title-input"
              />
              <button
                onClick={() => {
                  const updatedCategories = categories.filter(
                    (_, i) => i !== index
                  );
                  setCategories(updatedCategories);
                }}
                className="delete-category-button"
              >
                Delete
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newCategory: Category = {
                title: '',
              };
              setCategories([...categories, newCategory]);
            }}
            className="add-category-button"
          >
            Add Category
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsEditor;
