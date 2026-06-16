import { useEffect, useRef, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import Avatar from '../Avatar';
import useAuth from '../../hooks/useAuth';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

export default function ChatWindow({ selectedUser, socket }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const { token, user } = useAuth();
  const endRef = useRef(null);
  const typingTimeout = useRef(null);

  // Fetch messages
  useEffect(() => {
    if (!selectedUser) return;
    const fetchMessages = async () => {
      const res = await fetch(`/api/messages/${selectedUser._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessages(data);
    };
    fetchMessages();
  }, [selectedUser, token]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    socket.on('newMessage', (msg) => {
      if (
        msg.senderId === selectedUser?._id ||
        msg.receiverId === selectedUser?._id
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    socket.on('typing', ({ senderId }) => {
      if (senderId === selectedUser?._id) setIsTyping(true);
    });
    socket.on('stopTyping', ({ senderId }) => {
      if (senderId === selectedUser?._id) setIsTyping(false);
    });
    return () => {
      socket.off('newMessage');
      socket.off('typing');
      socket.off('stopTyping');
    };
  }, [socket, selectedUser]);

  // Auto scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = (e) => {
    setText(e.target.value);
    socket?.emit('typing', { receiverId: selectedUser._id });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket?.emit('stopTyping', { receiverId: selectedUser._id });
    }, 1500);
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    const res = await fetch(`/api/messages/send/${selectedUser._id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();
    setMessages((prev) => [...prev, data]);
    setText('');
    setShowEmoji(false);
  };

  if (!selectedUser) {
    return (
      <div className="chat-empty">
        <span>💬</span>
        <h3>Select a conversation</h3>
        <p>Pick a user from the left to start chatting</p>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <Avatar user={selectedUser} size="md" showStatus />
        <div>
          <h3 className="chat-header-name">{selectedUser.name}</h3>
          <span className="chat-header-status">
            {selectedUser.isOnline ? 'Active now' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <MessageBubble
            key={msg._id || i}
            message={msg}
            isMe={msg.senderId === user._id}
          />
        ))}
        {isTyping && (
          <TypingIndicator name={selectedUser.name} />
        )}
        <div ref={endRef} />
      </div>

      {/* Emoji Picker */}
      {showEmoji && (
        <div className="emoji-picker-wrap">
          <EmojiPicker
            onEmojiClick={(e) => setText((prev) => prev + e.emoji)}
            theme="dark"
            height={350}
          />
        </div>
      )}

      {/* Input */}
      <div className="chat-input-bar">
        <button
          className="emoji-toggle"
          onClick={() => setShowEmoji((v) => !v)}
        >
          😊
        </button>
        <input
          className="chat-input"
          placeholder={`Message ${selectedUser.name}...`}
          value={text}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          className="btn btn-primary btn-sm"
          onClick={sendMessage}
          disabled={!text.trim()}
        >
          ➤
        </button>
      </div>
    </div>
  );
}