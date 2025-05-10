import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');

  const API =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8001/backend/password.php'
    : './backend/password.php';

  const handleReset = async () => {
    if (password !== confirm) {
      setMessage("Passwords do not match");
      return;
    }

    const res = await fetch(API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage(data.message || 'Password changed successfully');
    } else {
      setMessage(data.error || 'Error resetting password');
    }
  };

  if (!token) return <p>Missing reset token.</p>;

  return (
    <div>
      <h2>Reset Your Password</h2>
      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirm password"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
      />
      <button onClick={handleReset}>Reset Password</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ResetPasswordPage;
