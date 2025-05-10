import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import BlogEditor from './pages/BlogEditor';
import { use, useEffect, useState } from 'react';
import { checkAndSetupDatabase, fetchCategories, logout } from './backend/api';
import {
  categoriesHolder,
  getHolderCategories,
  getHolderUserSettings,
  userSettingsHolder,
} from './utils/DataHolder';
import { UserSettings } from './model/UserSettings';
import UserSettingsEditor from './pages/UserSettingsEditor';
import { Category } from './model/Category';
import LoginPage from './pages/LoginPage';
import AuthGuard from './utils/AuthGuard';
import { useAuth } from './hooks/useAuth';
import ResetPasswordPage from './pages/PasswordReset';
import RequestResetPage from './pages/RequestPasswordReset';

const App = () => {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const { isAuthenticated, isLoading } = useAuth();

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

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const titleElement = () => {
    if(userSettings?.encodedLogo)
    {
      return (
        <img
                src={userSettings?.encodedLogo}
                alt={userSettings?.title}
                className="uploaded-logo-preview"
              />
      );
    }
    if (userSettings?.title) {
      return <h1 className="header-title">{userSettings?.title}</h1>;
    }
    return <h1 className="header-title">My Blog</h1>;
  }

  return (
    <>
      {userSettings?.showTitle && (
        <header className="header">
          {
            titleElement()
          }
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

            {isAuthenticated && (
              <>
                <a href="/new" className="menu-link">
                  📝
                </a>
                <a href="/admin" className="menu-link">
                  🛠️
                </a>
                <a className="menu-link" onClick={handleLogout}>
                  Logout
                </a>
              </>
            )}
            {/* {!isAuthenticated && (
              <a href="/login" className="menu-link">
                🔑
              </a>
            )} */}
          </nav>
        </header>
      )}
      <Router>
        <Routes>
          <Route path="/" element={<BlogList />} />
          <Route path="/:category" element={<BlogList />} />
          <Route path="/post/:id" element={<BlogPost />} />
          <Route
            path="/new"
            element={
              <AuthGuard>
                <BlogEditor />
              </AuthGuard>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <AuthGuard>
                <BlogEditor />
              </AuthGuard>
            }
          />
          <Route
            path="/admin"
            element={
              <AuthGuard>
                <UserSettingsEditor />
              </AuthGuard>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<RequestResetPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
