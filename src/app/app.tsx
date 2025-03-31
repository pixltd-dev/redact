import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import BlogEditor from './pages/BlogEditor';
import { useEffect, useState } from 'react';
import { checkAndSetupDatabase } from './backend/api';
import { getHolderUserSettings, userSettingsHolder } from './utils/DataHolder';
import { UserSettings } from './model/UserSettings';
import UserSettingsEditor from './pages/UserSettingsEditor';

const App = () => {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  const loadUserSettings = async () => {
    try {
      const settings = await getHolderUserSettings();
      setUserSettings(settings);
      console.log('User settings loaded:', settings);
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  useEffect(() => {
    loadUserSettings();
  }, []);

  useEffect(() => {
    loadUserSettings();
  }, [userSettingsHolder]);

  return (
    <>
      {userSettings?.showTitle && (
        <header className="header">
          <h1 className="header-title">My Blog</h1>
          <nav className="menu">
            <a href="/" className="menu-link">
              Home
            </a>
            <a href="/new" className="menu-link">
              New Post
            </a>
            <a href="/admin" className="menu-link">
              Admin
            </a>
          </nav>
        </header>
      )}
      <Router>
        <Routes>
          <Route path="/" element={<BlogList />} />
          <Route path="/post/:id" element={<BlogPost />} />
          <Route path="/new" element={<BlogEditor />} />
          <Route path="/edit/:id" element={<BlogEditor />} />
          <Route path="/admin" element={<UserSettingsEditor />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
