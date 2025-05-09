import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAndSetupDatabase } from '../backend/api';

const API =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8001/backend/user.php'
    : './backend/user.php';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(API, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          navigate('/');
        } else {
          setUserExists(data.userExists);
        }
      });
  }, [navigate]);

  const handleLogin = async () => {
    try {
      const res = await fetch(API, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.status === 201 || res.status === 200) {
        window.location.href = '/';
      } else {
        const err = await res.json();
        setError(err.error || 'Login failed');
      }
    } catch (e) {
      setError('Network error');
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

  return (
    <div>
      <h2>{userExists ? 'Login' : 'Create Admin Account'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>
        {userExists ? 'Login' : 'Create & Login'}
      </button>

            <div className="user-settings-editor col justify-center align-center">
        <h1 className="editor-title">Database Setup</h1>
        <p className="setup-message">
          Click the button below to check and set up the database.
        </p>
        <button onClick={handleCheckDatabase} className="save-button">
          Start process
        </button>
      </div>
    </div>
    
  );
};

export default LoginPage;
