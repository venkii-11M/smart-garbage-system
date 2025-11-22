import React, { useState } from 'react';
import { Users, Lock, Mail } from 'lucide-react';
import './Login.css';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (username === 'admin' && password === 'admin123') {
        onLogin({ 
          name: 'Admin User', 
          email: 'admin@smartgarbage.com' 
        });
      } else {
        alert('Invalid credentials. Use admin/admin123');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="brand">
            <span className="brand-icon">🗑️</span>
            <h1>Smart Garbage</h1>
          </div>
          <h2>Join our eco community</h2>
          <p>Manage your smart garbage collection system efficiently</p>
        </div>

        <div className="login-right">
          <div className="login-card">
            <div className="login-header">
              <div className="login-icon">
                <Users />
              </div>
              <h2>Admin Login</h2>
              <p>Access your admin dashboard</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <Mail size={20} />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <Lock size={20} />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="login-footer">
              <p>Demo credentials: <strong>admin / admin123</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}