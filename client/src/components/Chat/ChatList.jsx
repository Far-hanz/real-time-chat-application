import { useEffect, useState } from 'react';
import Avatar from '../Avatar';
import useAuth from '../../hooks/useAuth';

export default function ChatList({ selectedUser, onSelectUser }) {
  const [users, setUsers] = useState([]);
  /*const FAKE_USERS = [
  { _id: '1', name: 'Farhan', isOnline: true },
  { _id: '2', name: 'Saud', isOnline: true },
  { _id: '3', name: 'Siri', isOnline: false },
  { _id: '4', name: 'Vinusha', isOnline: true },
];

const [users, setUsers] = useState(FAKE_USERS);
*/
  const [search, setSearch] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    };
    fetchUsers();
  }, [token]);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="chat-sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Messages</h2>
        <div className="sidebar-search">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="sidebar-users">
        {filtered.length === 0 && (
          <p className="no-users">No users found</p>
        )}
        {filtered.map((user) => (
          <div
            key={user._id}
            className={`user-row ${selectedUser?._id === user._id ? 'user-row-active' : ''}`}
            onClick={() => onSelectUser(user)}
          >
            <Avatar user={user} size="md" showStatus />
            <div className="user-row-info">
              <span className="user-row-name">{user.name}</span>
              <span className="user-row-status">
                {user.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}