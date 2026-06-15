import { useState } from "react";
import axios from "axios";
import { useChat } from "../context/ChatContext";

const CreateGroupChat = ({ allUsers = [], onClose }) => {
  const { fetchChats } = useChat();
  const [groupName, setGroupName] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Filter users by search query
  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) &&
      !selectedUsers.find((s) => s._id === u._id)
  );

  const handleAddUser = (user) => {
    setSelectedUsers((prev) => [...prev, user]);
    setSearchUser("");
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers((prev) => prev.filter((u) => u._id !== userId));
  };

  const handleCreate = async () => {
    setError("");
    if (!groupName.trim()) {
      setError("Please enter a group name.");
      return;
    }
    if (selectedUsers.length < 2) {
      setError("Please add at least 2 other members.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        "/api/chats/group",
        {
          name: groupName.trim(),
          participants: selectedUsers.map((u) => u._id),
        },
        { headers }
      );
      await fetchChats();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create group.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">New Group Chat</h2>

        {/* Group Name */}
        <div className="form-group">
          <label>Group Name</label>
          <input
            type="text"
            placeholder="e.g. Project Alpha Team"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Add Members */}
        <div className="form-group">
          <label>Add Members</label>
          <input
            type="text"
            placeholder="Search users..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className="input-field"
          />

          {/* User suggestions */}
          {searchUser && (
            <ul className="user-suggestions">
              {filteredUsers.length === 0 ? (
                <li className="no-results">No users found</li>
              ) : (
                filteredUsers.slice(0, 5).map((user) => (
                  <li
                    key={user._id}
                    onClick={() => handleAddUser(user)}
                    className="suggestion-item"
                  >
                    <img
                      src={user.avatar || "/default-avatar.png"}
                      alt={user.name}
                      className="avatar-sm"
                    />
                    <span>{user.name}</span>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        {/* Selected users chips */}
        {selectedUsers.length > 0 && (
          <div className="selected-chips">
            {selectedUsers.map((user) => (
              <span key={user._id} className="chip">
                {user.name}
                <button
                  onClick={() => handleRemoveUser(user._id)}
                  className="chip-remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {error && <p className="error-text">{error}</p>}

        {/* Actions */}
        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupChat;
