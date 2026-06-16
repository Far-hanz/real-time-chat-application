import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import useAuth from '../hooks/useAuth';
import ChatList from '../components/Chat/ChatList';
import ChatWindow from '../components/Chat/ChatWindow';
import NotificationBell from '../components/Notifications/NotificationBell';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);
  

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
  <Link to="/profile" className="topbar-user">
    <Avatar user={user} size="sm" showStatus />
    <span>{user.name}</span>
  </Link>
  <NotificationBell socket={null} />  {/* socket comes from Farhan later */}
  <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
    Log out
  </button>
</nav>
      </header>

      <main className="chat-shell">
        <ChatList
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
        />
        <ChatWindow selectedUser={selectedUser} />
      </main>
    </div>
  );
}