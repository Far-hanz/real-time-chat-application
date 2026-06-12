import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import useAuth from '../hooks/useAuth';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [details, setDetails] = useState({ name: user.name, avatar: user.avatar || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [detailsStatus, setDetailsStatus] = useState({ error: '', success: '' });
  const [passwordStatus, setPasswordStatus] = useState({ error: '', success: '' });
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const saveDetails = async (e) => {
    e.preventDefault();
    setDetailsStatus({ error: '', success: '' });
    setSavingDetails(true);
    try {
      await updateProfile({ name: details.name.trim(), avatar: details.avatar.trim() });
      setDetailsStatus({ error: '', success: 'Profile updated.' });
    } catch (err) {
      setDetailsStatus({ error: err.response?.data?.message || 'Could not save changes.', success: '' });
    } finally {
      setSavingDetails(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus({ error: '', success: '' });

    if (passwords.newPassword.length < 6) {
      setPasswordStatus({ error: 'New password must be at least 6 characters.', success: '' });
      return;
    }

    setSavingPassword(true);
    try {
      await updateProfile(passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      setPasswordStatus({ error: '', success: 'Password changed.' });
    } catch (err) {
      setPasswordStatus({ error: err.response?.data?.message || 'Could not change password.', success: '' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="page-shell">
      <div className="orb orb-a" aria-hidden="true" />

      <header className="page-topbar">
        <Link to="/" className="wordmark">
          pulse<span className="wordmark-dot" />
        </Link>
        <Link to="/" className="btn btn-ghost btn-sm">
          ← Back to chats
        </Link>
      </header>

      <main className="profile-wrap">
        <section className="profile-hero reveal">
          <Avatar user={{ ...user, avatar: details.avatar }} size="xl" showStatus />
          <div>
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-meta">
              {user.email} · joined {formatDate(user.createdAt)}
            </p>
            <p className="profile-presence" data-online={user.isOnline}>
              {user.isOnline ? 'online now' : 'offline'}
            </p>
          </div>
        </section>

        <section className="profile-card reveal" style={{ animationDelay: '0.1s' }}>
          <h2 className="card-heading">Profile details</h2>
          <form className="auth-form" onSubmit={saveDetails}>
            {detailsStatus.error && (
              <p className="form-error" role="alert">
                {detailsStatus.error}
              </p>
            )}
            {detailsStatus.success && <p className="form-success">{detailsStatus.success}</p>}

            <div className="field">
              <label htmlFor="profile-name">Display name</label>
              <input
                id="profile-name"
                type="text"
                value={details.name}
                onChange={(e) => setDetails({ ...details, name: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="profile-avatar">Avatar URL</label>
              <input
                id="profile-avatar"
                type="url"
                placeholder="https://…/you.png (leave empty for initials)"
                value={details.avatar}
                onChange={(e) => setDetails({ ...details, avatar: e.target.value })}
              />
            </div>

            <button className="btn btn-primary" type="submit" disabled={savingDetails}>
              {savingDetails ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </section>

        <section className="profile-card reveal" style={{ animationDelay: '0.18s' }}>
          <h2 className="card-heading">Change password</h2>
          <form className="auth-form" onSubmit={savePassword}>
            {passwordStatus.error && (
              <p className="form-error" role="alert">
                {passwordStatus.error}
              </p>
            )}
            {passwordStatus.success && <p className="form-success">{passwordStatus.success}</p>}

            <div className="field-grid">
              <div className="field">
                <label htmlFor="current-password">Current password</label>
                <input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="new-password">New password</label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="6+ characters"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={savingPassword}>
              {savingPassword ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </section>

        <section className="profile-card profile-danger reveal" style={{ animationDelay: '0.26s' }}>
          <div>
            <h2 className="card-heading">Sign out</h2>
            <p className="card-note">Ends this session and marks you offline.</p>
          </div>
          <button className="btn btn-danger" type="button" onClick={handleLogout}>
            Log out
          </button>
        </section>
      </main>
    </div>
  );
}
