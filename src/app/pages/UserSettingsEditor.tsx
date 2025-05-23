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
import { Category } from '../model/Category';
import { useAppData } from '../utils/AppDataContext';
import { toast, ToastContainer } from 'react-toastify';

const UserSettingsEditor: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [workingCategories, setWorkingCategories] = useState<Category[]>([]);
  const [originalCategories, setOriginalCategories] = useState<Category[]>([]);
  const { setCategories, setUserSettings } = useAppData();
  const [requestInProgress, setRequestInProgress] = useState(false);

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
          setWorkingCategories(fetchedCategories);
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

  const handleShowHomeCategory = () => {
    if (settings) {
      setSettings({ ...settings, showHomeCategory: !settings.showHomeCategory });
    }
  }

  const handleToggleShowFullPosts = () => {
    if (settings) {
      setSettings({ ...settings, showFullPosts: !settings.showFullPosts });
    }
  };

  const handleCheckDatabase = async () => {
    setRequestInProgress(true);
    try {
      await checkAndSetupDatabase();
      toast.success('Database is set up correctly!');
    } catch (err) {
      setError('Failed to check database.');
    }
    setRequestInProgress(false);
  };

  const handeUpdatedCategories = async () => {
    const uniqueCategories = workingCategories.filter(
      (category, index, self) => {
        const trimmedTitle = category.title.trim().toLowerCase();
        return (
          index ===
          self.findIndex(
            (cat) => cat.title.trim().toLowerCase() === trimmedTitle
          )
        );
      }
    );

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

      setCategories(uniqueCategories);
    } catch (err) {
      setError('Failed to update categories.');
    }
  };

  const handleSave = async () => {
    setRequestInProgress(true);
    handeUpdatedCategories();

    if (settings) {
      if (settings.showTitle === undefined) {
        settings.showTitle = true;
      }
      if (settings.showHomeCategory === undefined) {
        settings.showHomeCategory = true;
      }
      try {
        const success = await updateUserSettings(settings);
        if (success) {
          setUserSettings(settings);
          toast.success('Settings saved successfully!');   
        } else {
          throw new Error('Failed to save settings.');
        }
      } catch (err) {
        setError('Failed to save user settings.');
      }
    }

    setRequestInProgress(false);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!settings) {
    return (
      <>
        <div className="no-settings">No settings available.</div>
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
  }

  return (
    <>
      {requestInProgress && (
        <div className="loading-overlay">
          <div className="loading-spinner">
          </div>
        </div>
      )}
      <div className="user-settings-editor col justify-center align-center">
        <h1 className="editor-title">Settings</h1>
        <div className="settings-item col">
          <input
            type="text"
            value={settings.title}
            onChange={(e) => {
              if (settings) {
                setSettings({ ...settings, title: e.target.value });
              }
            }}
            placeholder="Title"
            className="editor-input"
          />

          <h1 className="settings-label">Upload Logo</h1>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const reader = new FileReader();
                if (file.size > 2 * 1024 * 1024) {
                  toast.error('File size exceeds 2MB. Please upload a smaller file.');
                  return;
                }
                reader.onload = () => {
                  if (settings) {
                    setSettings({
                      ...settings,
                      encodedLogo: reader.result as string,
                    });
                  }
                };
                reader.readAsDataURL(file);
              }
            }}
            className="file-input"
          />
          {settings.encodedLogo && (
            <>
              <div className="spacer-small" />
              <img
                src={settings.encodedLogo}
                alt="Uploaded Logo"
                className="uploaded-logo-preview"
              />
              <div className="spacer-small" />
              <button
                onClick={() => {
                  if (settings) {
                    setSettings({ ...settings, encodedLogo: '' });
                  }
                }}
                className="delete-category-button"
              >
                delete
              </button>
            </>
          )}

          <div className="spacer-small" />

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
          <label className="settings-label">
            <input
              type="checkbox"
              checked={settings.showHomeCategory}
              onChange={handleShowHomeCategory}
              className="settings-checkbox"
            />
            Show home category
          </label>
        </div>

        <div className="row justify-center align-center">
          <h1 className="editor-title">Categories</h1>
          <button
            onClick={() => {
                const maxSortIndex = workingCategories.length
                ? Math.max(...workingCategories.map((cat) => cat.sort_index ?? 0))
                : 0;
                const newCategory: Category = {
                title: '',
                sort_index: maxSortIndex + 10,
                };
              setWorkingCategories([...workingCategories, newCategory]);
            }}
            className="add-category-button"
          >
            +
          </button>
        </div>
        <div className="settings-item">
          <div className="categories-list">
            {[...workingCategories]
              .sort((a, b) => (a.sort_index ?? 0) - (b.sort_index ?? 0))
              .map((category, index) => (
              <div key={category.id} className="category-item">
                <input
                  type="text"
                  value={category.title}
                  onChange={(e) => {
                    const updatedCategories = [...workingCategories];
                    updatedCategories[index] = {
                      ...category,
                      title: e.target.value,
                    };
                    setWorkingCategories(updatedCategories);
                  }}
                  className="category-title-input"
                />
                <button
                  onClick={() => {
                    if (index > 0) {
                      const updatedCategories = [...workingCategories];
                      // Swap with the previous category
                      [updatedCategories[index - 1], updatedCategories[index]] = [
                        updatedCategories[index],
                        updatedCategories[index - 1],
                      ];
                      // Optionally update sort_index to maintain order
                      updatedCategories.forEach((cat, idx) => {
                        cat.sort_index = (idx + 1) * 10;
                      });
                      setWorkingCategories(updatedCategories);
                    }
                  }}
                  className="sort-category-button"
                >
                  ⬆️
                </button>
                <button
                  onClick={() => {
                    if (index < workingCategories.length - 1) {
                      const updatedCategories = [...workingCategories];
                      // Swap with the next category
                      [updatedCategories[index + 1], updatedCategories[index]] = [
                        updatedCategories[index],
                        updatedCategories[index + 1],
                      ];
                      // Optionally update sort_index to maintain order
                      updatedCategories.forEach((cat, idx) => {
                        cat.sort_index = (idx + 1) * 10;
                      });
                      setWorkingCategories(updatedCategories);
                    }
                  }}
                  className="sort-category-button"
                >
                  ⬇️
                </button>
                <button
                  onClick={() => {
                    const updatedCategories = workingCategories.filter(
                      (_, i) => i !== index
                    );
                    setWorkingCategories(updatedCategories);
                  }}
                  className="delete-category-button"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
        <button onClick={handleSave} className="save-button" disabled={requestInProgress}>
          Save changes
        </button>
      </div>
      <div className="spacer-small" />
      <div className="user-settings-editor col justify-center align-center">
        <h1 className="editor-title">Database Setup</h1>
        <p className="setup-message">
          Click the button below to check and set up the database.
        </p>
        <button onClick={handleCheckDatabase} className="save-button" disabled={requestInProgress}>
          Start process
        </button>
      </div>
    </>
  );
};

export default UserSettingsEditor;
