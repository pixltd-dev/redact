import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import BlogEditor from './pages/BlogEditor';
import { useEffect, useState } from 'react';
import { checkAndSetupDatabase, fetchCategories } from './backend/api';
import {
  categoriesHolder,
  getHolderCategories,
  getHolderUserSettings,
  userSettingsHolder,
} from './utils/DataHolder';
import { UserSettings } from './model/UserSettings';
import UserSettingsEditor from './pages/UserSettingsEditor';
import { Category } from './model/Category';

const App = () => {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const loadUserSettings = async () => {
    try {
      const settings = await getHolderUserSettings();
      setUserSettings(settings);
      console.log('User settings loaded:', settings);
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesFromBE = await fetchCategories();
      setCategories(categoriesFromBE);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  useEffect(() => {
    loadUserSettings();
    loadCategories();
  }, []);

  useEffect(() => {
    loadUserSettings();
  }, [userSettingsHolder]);

  useEffect(() => {
    setCategories(getHolderCategories());
  }, [categoriesHolder]);

  return (
    <>
      {userSettings?.showTitle && (
        <header className="header">
          <h1 className="header-title">My Blog</h1>
          <nav className="menu">
            <a href="/" className="menu-link">
              Home
            </a>
            {categories.map((category) => (
              <a
                key={category.id}
                href={`/${category.id}`}
                className="menu-link"
              >
                {category.title}
              </a>
            ))}
            <a href="/new" className="menu-link">
              📝
            </a>
            <a href="/admin" className="menu-link">
              🛠️
            </a>
          </nav>
        </header>
      )}
      <Router>
        <Routes>
          <Route path="/" element={<BlogList />} />
          <Route path="/:category" element={<BlogList />} />
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
