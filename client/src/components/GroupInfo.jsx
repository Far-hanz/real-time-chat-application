import { useState } from "react";
import axios from "axios";
import { useChat } from "../context/ChatContext";

const GroupInfo = ({ currentUser, allUsers = [], onClose, socket }) => {
  const { selectedChat, setSelectedChat, fetchChats } = useChat();
  const [newName, setNewName] = useState(selectedChat?.chatName || "");
  const [renaming, setRenaming] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const isAdmin =
    selectedChat?.groupAdmin?._id === currentUser._id ||
    selectedChat?.groupAdmin === currentUser._id;

  const participants = selectedChat?.participants || [];

  const handleRename = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      const { data } = await axios.patch(
        `/api/chats/${selectedChat._id}/rename`,
        { name: newName },
        { headers }
      );
      setSelectedChat(data);
      socket?.emit("group_renamed", { chatId: selectedChat._id, newName });
      setRenaming(false);
      setMessage("Group renamed successfully!");
      await fetchChats();
    } catch (err) {
      setMessage(err.response?.data?.message || "Rename failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (userId, userName) => {
    setLoading(true);
    try {
      const { data } = await axios.patch(
        `/api/chats/${selectedChat._id}/add`,
        { userId },
        { headers }
      );
      setSelectedChat(data);
      socket?.emit("member_added", { chatId: selectedChat._id, newMember: { _id: userId, name: userName } });
      setMessage(`${userName} added to group.`);
      setSearchUser("");
      await fetchChats();
    } catch (err) {
      setMessage(err.response?.data?.message || "Add failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId, userName) => {
    if (!window.confirm(`Remove ${userName} from the group?`)) return;
    setLoading(true);
    try {
      const { data } = await axios.patch(
        `/api/chats/${selectedChat._id}/remove`,
        { userId },
        { headers }
      );
      setSelectedChat(data);
      socket?.emit("member_removed", { chatId: selectedChat._id, removedMember: { _id: userId, name: userName } });
      setMessage(`${userName} removed.`);
      await fetchChats();
    } catch (err) {
      setMessage(err.response?.data?.message || "Remove failed.");
    } finally {
      setLoading(false);
    }
  };

  const addableUsers = allUsers.filter(
    (u) =>
      !participants.find((p) => (p._id || p) === u._id) &&
      u.name.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="group-info-panel">
      <div className="panel-header">
        <h3>Group Info</h3>
        <button onClick={onClose} className="close-btn">✕</button>
      </div>

      {/* Group name */}
      <div className="group-name-section">
        {renaming ? (
          <div className="rename-form">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="input-field"
            />
            <button onClick={handleRename} disabled={loading} className="btn-primary">
              Save
            </button>
            <button onClick={() => setRenaming(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        ) : (
          <div className="group-name-display">
            <h2>{selectedChat?.chatName}</h2>
            {isAdmin && (
              <button onClick={() => setRenaming(true)} className="edit-btn" title="Rename group">
                ✏️
              </button>
            )}
          </div>
        )}
        <p className="member-count">{participants.length} members</p>
      </div>

      {message && <p className="status-message">{message}</p>}

      {/* Members list */}
      <div className="members-section">
        <h4>Members</h4>
        {participants.map((p) => {
          const pId = p._id || p;
          const pName = p.name || "Unknown";
          const isMe = pId === currentUser._id;
          const isGroupAdmin =
            (selectedChat?.groupAdmin?._id || selectedChat?.groupAdmin) === pId;

          return (
            <div key={pId} className="member-row">
              <img
                src={p.avatar || "/default-avatar.png"}
                alt={pName}
                className="avatar-sm"
              />
              <div className="member-info">
                <span className="member-name">
                  {pName} {isMe && "(You)"}
                </span>
                {isGroupAdmin && <span className="admin-badge">Admin</span>}
              </div>
              {/* Admin can remove others; anyone can remove themselves */}
              {(isAdmin || isMe) && !isGroupAdmin && (
                <button
                  onClick={() => handleRemove(pId, pName)}
                  className="remove-btn"
                  title={isMe ? "Leave group" : "Remove member"}
                >
                  {isMe ? "Leave" : "✕"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add members (admin only) */}
      {isAdmin && (
        <div className="add-members-section">
          <h4>Add Members</h4>
          <input
            type="text"
            placeholder="Search users..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className="input-field"
          />
          {searchUser && (
            <ul className="user-suggestions">
              {addableUsers.length === 0 ? (
                <li className="no-results">No users to add</li>
              ) : (
                addableUsers.slice(0, 5).map((u) => (
                  <li key={u._id} className="suggestion-item">
                    <img src={u.avatar || "/default-avatar.png"} alt={u.name} className="avatar-xs" />
                    <span>{u.name}</span>
                    <button
                      onClick={() => handleAdd(u._id, u.name)}
                      className="add-btn"
                      disabled={loading}
                    >
                      + Add
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupInfo;
