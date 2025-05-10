import { useState } from 'react';

const RequestResetPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleRequest = async () => {
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setMessage('Please provide a valid email address');
      return;
    }
    
    const res = await fetch('http://localhost:8001/backend/password.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
  };

  return (
    <div>
      <div className="user-settings-editor col justify-center align-center">
        <h1 className="editor-title">Reset Password</h1>
      <input
        type="email"
        placeholder="Your email"
        className="editor-input"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <button onClick={() => handleRequest()}>Send Reset Link</button>
      <p className='error-message'>{message}</p>
      </div>
      
    </div>
  );
};

export default RequestResetPage;
