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

  const handleToggleShowFullPosts = () => {
    if (settings) {
      setSettings({ ...settings, showFullPosts: !settings.showFullPosts });
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
    const uniqueCategories = categories.filter((category, index, self) => {
      const trimmedTitle = category.title.trim().toLowerCase();
      return (
        index ===
        self.findIndex((cat) => cat.title.trim().toLowerCase() === trimmedTitle)
      );
    });

    try {
      uniqueCategories.map(async (category) => {
        await createCategory(category);
      });

      originalCategories.map(async (originalCategory) => {
        const category = uniqueCategories.find(
          (cat) => cat.id === originalCategory.id
        );
        if (!category) {
          await deleteCategory(originalCategory);
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
    <>
      <div className="user-settings-editor col justify-center align-center">
        <h1 className="editor-title">Settings</h1>
        <div className="settings-item col">
          <label className="settings-label">
            <input
              type="checkbox"
              checked={settings.showTitle}
              onChange={handleToggleShowTitle}
              className="settings-checkbox"
            />
            Show Title
          </label>
          <label className="settings-label">
            <input
              type="checkbox"
              checked={settings.showFullPosts}
              onChange={handleToggleShowFullPosts}
              className="settings-checkbox"
            />
            Show full posts
          </label>
        </div>

        <div className="row justify-center align-center">
          <h1 className="editor-title">Categories</h1>
          <button
            onClick={() => {
              const newCategory: Category = {
                title: '',
              };
              setCategories([...categories, newCategory]);
            }}
            className="add-category-button"
          >
            +
          </button>
        </div>
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
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
        <button onClick={handleSave} className="save-button">
          Save changes
        </button>
      </div>
      <div className="spacer-small" />
      <div className="user-settings-editor col justify-center align-center">
        <h1 className="editor-title">Database Setup</h1>
        <p className="setup-message">
          Click the button below to check and set up the database.
        </p>
        <button onClick={handleCheckDatabase} className="save-button">
          Start process
        </button>
      </div>
    </>
  );
};

export default UserSettingsEditor;
