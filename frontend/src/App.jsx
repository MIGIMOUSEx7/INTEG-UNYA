import { useState, useEffect } from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom'
import './App.css'

// --- 1. LANDING PAGE ---
const LandingPage = () => (
  <div className="page landing">
    <nav className="navbar">
      <div className="logo-text">INTEG<span>.io</span></div>
      <Link to="/auth" className="nav-btn">Get Started</Link>
    </nav>
    <div className="hero-content">
      <h1 className="glitch-text">Build Faster.</h1>
      <p className="subtitle">The ultimate Django + Vite foundation for your next project.</p>
      <Link to="/auth" className="hero-submit-btn">Start Developing</Link>
    </div>
  </div>
);

// --- 2. AUTH PAGE ---
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault()
    const endpoint = isLogin ? 'auth/jwt/create/' : 'auth/users/'
    setMessage('Processing...')
    
    try {
      const payload = isLogin ? { username, password } : { username, email, password }
      const response = await axios.post(`http://127.0.0.1:8000/${endpoint}`, payload)

      if (isLogin) {
        localStorage.setItem('token', response.data.access)
        setMessage("✅ Welcome back!")
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setMessage("✅ Account created! Please sign in.")
        setIsLogin(true)
      }
    } catch (error) {
      const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : "Request failed.";
      setMessage("❌ Error: " + errorDetail);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{isLogin ? 'Sign In' : 'Join Us'}</h1>
          <p className="subtitle">{isLogin ? 'Enter credentials to continue' : 'Create your account'}</p>
        </div>
        {message && <div className={`alert ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Username</label>
            <input type="text" placeholder="e.g. user123" required onChange={(e) => setUsername(e.target.value)} />
          </div>
          {!isLogin && (
            <div className="input-group">
              <label>Email Address</label>
              <input type="email" placeholder="name@example.com" required onChange={(e) => setEmail(e.target.value)} />
            </div>
          )}
          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" required onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="submit-btn">{isLogin ? 'Login' : 'Register'}</button>
        </form>
        <button onClick={() => {setIsLogin(!isLogin); setMessage('');}} className="toggle-btn">
          {isLogin ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  )
}

// --- 3. DASHBOARD ---
const Dashboard = () => {
  const [user, setUser] = useState({ username: '', email: '' });
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/auth'); return; }
    const getUserData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/auth/users/me/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('token');
        navigate('/auth');
      }
    };
    getUserData();
  }, [token, navigate]);

  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar-new">
        <div className="sidebar-brand">INTEG<span>.io</span></div>
        <nav className="sidebar-menu">
          <div className="menu-label">Main Menu</div>
          <Link to="/dashboard" className="menu-item active">📊 Overview</Link>
          <div className="menu-label" style={{marginTop: '20px'}}>User</div>
          <Link to="/profile" className="menu-item">👤 Profile Settings</Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={() => {localStorage.removeItem('token'); navigate('/')}} className="logout-btn-new">Logout System</button>
        </div>
      </aside>
      <main className="main-content-new">
        <header className="top-profile-bar">
          <div className="search-bar-dummy">Search something...</div>
          <div className="profile-section">
            <div className="profile-info">
              <span className="profile-name">{user.username || 'User'}</span>
              <span className="profile-role">Administrator</span>
            </div>
            <div className="profile-avatar-big">{user.username ? user.username[0].toUpperCase() : '?'}</div>
          </div>
        </header>
        <div className="content-padding">
          <div className="welcome-banner">
            <h2>Welcome back, {user.username || 'user'}! 👋</h2>
            <p>System running on Django + Djoser.</p>
          </div>
          <div className="stats-container-new">
            <div className="glass-card"><span className="card-icon">⚡</span><div className="card-data"><p>API Status</p><h3 className="online">Connected</h3></div></div>
            <div className="glass-card"><span className="card-icon">🗄️</span><div className="card-data"><p>Database</p><h3>SQLite 3</h3></div></div>
            <div className="glass-card"><span className="card-icon">⏱️</span><div className="card-data"><p>Uptime</p><h3>99.99%</h3></div></div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- 4. PROFILE PAGE ---
const ProfilePage = () => {
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/auth'); return; }
    axios.get('http://127.0.0.1:8000/auth/users/me/', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
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
    setStatus('Updating...');
    try {
      await axios.patch('http://127.0.0.1:8000/auth/users/me/', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus('✅ Profile updated successfully!');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setStatus('❌ Error: ' + JSON.stringify(err.response?.data || "Update failed"));
    }
  };

  if (loading) return <div className="page landing">Loading...</div>;

  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar-new">
        <div className="sidebar-brand">INTEG<span>.io</span></div>
        <nav className="sidebar-menu">
          <div className="menu-label">Main Menu</div>
          <Link to="/dashboard" className="menu-item">📊 Overview</Link>
          <div className="menu-label" style={{marginTop: '20px'}}>User</div>
          <Link to="/profile" className="menu-item active">👤 Profile Settings</Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={() => {localStorage.removeItem('token'); navigate('/')}} className="logout-btn-new">Logout System</button>
        </div>
      </aside>
      <main className="main-content-new">
        <header className="top-profile-bar">
          <div className="logo-text">Profile <span>Settings</span></div>
          <div className="profile-section">
            <div className="profile-info"><span className="profile-name">{formData.username}</span></div>
            <div className="profile-avatar-big">
                {formData.username ? formData.username[0].toUpperCase() : '?'}
            </div>
          </div>
        </header>
        <div className="content-padding">
          <div className="auth-card" style={{maxWidth: '500px', margin: '0 auto'}}>
            <h2 style={{textAlign: 'center', marginBottom: '20px'}}>Edit Profile</h2>
            {status && <div className={`alert ${status.includes('✅') ? 'success' : 'error'}`} style={{marginBottom: '20px'}}>{status}</div>}
            <form onSubmit={handleUpdate}>
              <div className="input-group">
                <label>Username</label>
                <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
              </div>
              <div className="input-group" style={{marginTop: '15px'}}>
                <label>Email Address</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <button type="submit" className="submit-btn" style={{marginTop: '25px'}}>Save Changes</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  )
}

export default App;