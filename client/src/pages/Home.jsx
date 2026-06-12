import { Link, useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import useAuth from '../hooks/useAuth';

// Placeholder landing for signed-in users.
// The chat interface (sidebar, threads, messages) plugs in here:
//   - One-to-one messaging + typing indicator  -> Siri
//   - Groups, history, search, read receipts   -> Vinusha
//   - Chat UI, notifications, reactions        -> Deepthi
export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="page-shell">
      <div className="orb orb-a" aria-hidden="true" />
      <div className="orb orb-b" aria-hidden="true" />

      <header className="page-topbar">
        <span className="wordmark">
          pulse<span className="wordmark-dot" />
        </span>
        <nav className="topbar-actions">
          <Link to="/profile" className="topbar-user" title="Your profile">
            <Avatar user={user} size="sm" showStatus />
            <span>{user.name}</span>
          </Link>
          <button className="btn btn-ghost btn-sm" type="button" onClick={handleLogout}>
            Log out
          </button>
        </nav>
      </header>

      <main className="home-wrap">
        <p className="auth-eyebrow reveal">signed in · auth module</p>
        <h1 className="home-title reveal" style={{ animationDelay: '0.08s' }}>
          You're in, {user.name.split(' ')[0]}.
        </h1>
        <p className="home-subtitle reveal" style={{ animationDelay: '0.16s' }}>
          Authentication and user management are live. The conversation view — messages,
          groups, typing indicators and notifications — lands here next.
        </p>
        <div className="home-actions reveal" style={{ animationDelay: '0.24s' }}>
          <Link to="/profile" className="btn btn-primary">
            Manage your profile
          </Link>
        </div>
      </main>
    </div>
  );
}
