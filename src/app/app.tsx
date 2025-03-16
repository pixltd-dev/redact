import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import BlogEditor from './pages/BlogEditor';
import { useEffect } from 'react';
import { checkAndSetupDatabase } from './backend/api';

const App = () => {
  useEffect(() => {
    checkAndSetupDatabase();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<BlogList />} />
        <Route path="/post/:id" element={<BlogPost />} />
        <Route path="/new" element={<BlogEditor />} />
        <Route path="/edit/:id" element={<BlogEditor />} />
      </Routes>
    </Router>
  );
};

export default App;
