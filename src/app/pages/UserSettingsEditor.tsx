import React, { useEffect, useState } from 'react';
import { UserSettings } from '../model/UserSettings';
import { fetchUserSettings, updateUserSettings } from '../backend/api';
import { setHolderUserSettings } from '../utils/DataHolder';

const UserSettingsEditor: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

    loadSettings();
  }, []);

  const handleToggleShowTitle = () => {
    if (settings) {
      setSettings({ ...settings, showTitle: !settings.showTitle });
    }
  };

  const handleSave = async () => {
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
      <button onClick={handleSave} className="save-button">
        Save
      </button>
    </div>
  );
};

export default UserSettingsEditor;
