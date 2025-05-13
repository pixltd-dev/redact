import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import BlogEditor from './pages/BlogEditor';
import { use, useEffect, useState } from 'react';
import { checkAndSetupDatabase, fetchCategories, fetchUserSettings, logout } from './backend/api';
import { UserSettings } from './model/UserSettings';
import UserSettingsEditor from './pages/UserSettingsEditor';
import { Category } from './model/Category';
import LoginPage from './pages/LoginPage';
import AuthGuard from './utils/AuthGuard';
import { useAuth } from './hooks/useAuth';
import ResetPasswordPage from './pages/PasswordReset';
import RequestResetPage from './pages/RequestPasswordReset';
import { useAppData } from './utils/AppDataContext';
import { BlogListWrapper } from './pages/BlogListWrapper';

const App = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { categories, userSettings, setCategories, setUserSettings } = useAppData();

  useEffect(() => {
    if(categories.length === 0 || userSettings === null)
    {
      loadDataAsync();
    }
  }, []);

  const loadDataAsync = async () => {
    try {
      var cat = await fetchCategories();
      var set = await fetchUserSettings();
      setCategories(cat);
      setUserSettings(set!);
    }
    catch (error) {
      console.error('Error loading data:', error);
    }
  };

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
      {(userSettings?.showTitle == true || userSettings?.showTitle === undefined) && (
        <header className="header">
          {
            titleElement()
          }
          <nav className="menu">
            <Link to="/" className="menu-link">
              Home
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/${category.id}`}
                className="menu-link"
              >
                {category.title}
              </Link>
            ))}

            {isAuthenticated && (
              <>
                <Link to="/new" className="menu-link">
                  📝
                </Link>
                <Link to="/admin" className="menu-link">
                  🛠️
                </Link>
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
        <Routes>
          <Route path="/" element={<BlogListWrapper />} />
          <Route path="/:category" element={<BlogListWrapper />} />

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
    </>
  );
};

export default App;
