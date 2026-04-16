import { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import './App.css';

// --- ROUTE GUARDS ---
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/auth" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
};

// --- 1. LANDING PAGE ---
const LandingPage = () => (
  <div className="page landing">
    <nav className="navbar">
      <div className="logo">
        <span className="logo-mark">I</span>
        <span className="logo-full">NTEG<em>.io</em></span>
      </div>
      <Link to="/auth" className="nav-cta">Get Started →</Link>
    </nav>

    <div className="hero">
      <div className="hero-badge">⚡ Django + Vite Starter</div>
      <h1 className="hero-title">
        Ship <span className="highlight">faster</span>.<br />
        Build smarter.
      </h1>
      <p className="hero-sub">
        A production-ready full-stack foundation — authentication, routing,<br />
        and a polished dashboard out of the box.
      </p>
      <div className="hero-actions">
        <Link to="/auth" className="btn-primary">Start Building</Link>
        <a href="#" className="btn-ghost">View Docs</a>
      </div>
    </div>

    <div className="features-strip">
      <div className="feature-pill">🔐 JWT Auth</div>
      <div className="feature-pill">⚡ Vite HMR</div>
      <div className="feature-pill">🗄️ SQLite Ready</div>
      <div className="feature-pill">🔄 Djoser</div>
      <div className="feature-pill">🛡️ Route Guards</div>
    </div>
  </div>
);

// --- 2. AUTH PAGE ---
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? 'auth/jwt/create/' : 'auth/users/';
    setMessage('');
    setLoading(true);

    try {
      const payload = isLogin ? { username, password } : { username, email, password };
      const response = await axios.post(`http://127.0.0.1:8000/${endpoint}`, payload);

      if (isLogin) {
        localStorage.setItem('token', response.data.access);
        setMessage({ type: 'success', text: 'Welcome back! Redirecting…' });
        setTimeout(() => navigate('/dashboard', { replace: true }), 900);
      } else {
        setMessage({ type: 'success', text: 'Account created! Please sign in.' });
        setIsLogin(true);
      }
    } catch (error) {
      const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : 'Request failed.';
      setMessage({ type: 'error', text: errorDetail });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="logo-mark">I</span>
          <span className="logo-full">NTEG<em>.io</em></span>
        </div>
        <div className="auth-tagline">
          <h2>Your development<br />foundation, ready.</h2>
          <p>Start coding what matters — authentication, routing, and user management already handled.</p>
        </div>
        <div className="auth-meta">© 2025 INTEG.io</div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1>{isLogin ? 'Welcome back' : 'Create account'}</h1>
            <p>{isLogin ? 'Sign in to your workspace' : 'Get started for free today'}</p>
          </div>

          {message && (
            <div className={`alert alert-${message.type}`}>
              {message.type === 'success' ? '✓' : '✕'} {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label>Username</label>
              <input
                type="text"
                placeholder="e.g. johndoe"
                required
                autoComplete="username"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {!isLogin && (
              <div className="field">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? <span className="spinner" /> : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="auth-toggle">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button onClick={() => { setIsLogin(!isLogin); setMessage(''); }}>
              {isLogin ? ' Register' : ' Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SHARED SIDEBAR ---
const Sidebar = ({ username, activePath }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <span className="logo-mark sm">I</span>
          <span className="logo-full sm">NTEG<em>.io</em></span>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{username ? username[0].toUpperCase() : '?'}</div>
          <div className="user-info">
            <span className="user-name">{username || '…'}</span>
            <span className="user-role">Administrator</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Workspace</div>
          <Link to="/dashboard" className={`nav-link ${activePath === '/dashboard' ? 'active' : ''}`}>
            <span className="nav-icon">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </span>
            Overview
          </Link>

          <div className="nav-section-label" style={{ marginTop: '24px' }}>Account</div>
          <Link to="/profile" className={`nav-link ${activePath === '/profile' ? 'active' : ''}`}>
            <span className="nav-icon">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            Profile Settings
          </Link>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <button className="logout-btn" onClick={handleLogout}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
};

// --- 3. DASHBOARD ---
const Dashboard = () => {
  const [user, setUser] = useState({ username: '', email: '' });
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/auth/users/me/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch {
        localStorage.removeItem('token');
        navigate('/auth');
      }
    };
    if (token) getUserData();
  }, [token, navigate]);

  const stats = [
    { icon: '⚡', label: 'API Status', value: 'Connected', valueClass: 'status-green' },
    { icon: '🗄️', label: 'Database', value: 'SQLite 3' },
    { icon: '⏱️', label: 'Uptime', value: '99.99%' },
  ];

  return (
    <div className="app-layout">
      <Sidebar username={user.username} activePath="/dashboard" />

      <div className="app-main">
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="page-title">Overview</h1>
          </div>
          <div className="topbar-right">
            <div className="topbar-greeting">Good day, <strong>{user.username || '…'}</strong></div>
          </div>
        </header>

        <div className="page-body">
          <div className="welcome-card">
            <div className="welcome-text">
              <h2>Welcome back, {user.username || 'there'} 👋</h2>
              <p>Your system is running smoothly on Django + Djoser.</p>
            </div>
            <div className="welcome-badge">All Systems Operational</div>
          </div>

          <section className="section">
            <h3 className="section-title">System Status</h3>
            <div className="stats-grid">
              {stats.map((s) => (
                <div className="stat-card" key={s.label}>
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-body">
                    <div className="stat-label">{s.label}</div>
                    <div className={`stat-value ${s.valueClass || ''}`}>{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <h3 className="section-title">Quick Actions</h3>
            <div className="actions-row">
              <Link to="/profile" className="action-card">
                <span>👤</span>
                <span>Edit Profile</span>
              </Link>
              <div className="action-card muted">
                <span>📦</span>
                <span>Manage Resources</span>
              </div>
              <div className="action-card muted">
                <span>📈</span>
                <span>View Analytics</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// --- 4. PROFILE PAGE ---
const ProfilePage = () => {
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/auth/users/me/', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setFormData({ username: res.data.username, email: res.data.email });
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/auth');
      });
  }, [token, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', text: 'Saving changes…' });
    try {
      await axios.patch('http://127.0.0.1:8000/auth/users/me/', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatus({ type: 'success', text: 'Profile updated successfully.' });
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      setStatus({ type: 'error', text: JSON.stringify(err.response?.data || 'Update failed') });
    }
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar username="" activePath="/profile" />
        <div className="app-main loading-state">Loading profile…</div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar username={formData.username} activePath="/profile" />

      <div className="app-main">
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="page-title">Profile Settings</h1>
          </div>
        </header>

        <div className="page-body">
          <div className="profile-grid">
            <div className="profile-sidebar-card">
              <div className="big-avatar">{formData.username[0]?.toUpperCase()}</div>
              <div className="big-username">{formData.username}</div>
              <div className="big-email">{formData.email}</div>
              <div className="role-badge">Administrator</div>
            </div>

            <div className="profile-form-card">
              <h3>Edit Information</h3>
              <p className="form-description">Update your username or email address below.</p>

              {status && (
                <div className={`alert alert-${status.type === 'loading' ? 'info' : status.type}`}>
                  {status.type === 'success' ? '✓' : status.type === 'error' ? '✕' : '⟳'} {status.text}
                </div>
              )}

              <form onSubmit={handleUpdate} className="auth-form">
                <div className="field">
                  <label>Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
                <div className="field" style={{ marginTop: '16px' }}>
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn-submit" style={{ marginTop: '24px' }}>
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN ROUTER ---
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GuestRoute><LandingPage /></GuestRoute>} />
        <Route path="/auth" element={<GuestRoute><AuthPage /></GuestRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;