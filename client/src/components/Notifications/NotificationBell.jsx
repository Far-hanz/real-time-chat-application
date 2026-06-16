import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function NotificationBell({ socket }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!socket) return;

    socket.on('newMessage', (msg) => {
      // Show toast notification
      toast.custom((t) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#2a2a3e',
            border: '1px solid rgba(108,99,255,0.3)',
            borderRadius: '14px',
            padding: '14px 16px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
            minWidth: '260px',
            opacity: t.visible ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        >
          <span style={{ fontSize: '24px' }}>💬</span>
          <div>
            <p style={{
              color: '#fff',
              fontSize: '13px',
              fontWeight: '700',
              margin: '0 0 2px',
            }}>
              {msg.senderName || 'New Message'}
            </p>
            <p style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '12px',
              margin: 0,
              maxWidth: '200px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {msg.message || msg.content}
            </p>
          </div>
        </div>
      ), { duration: 4000 });

      // Increment badge count
      setCount((c) => c + 1);

      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification(`New message from ${msg.senderName || 'Someone'}`, {
          body: msg.message || msg.content,
          icon: '/favicon.ico',
        });
      }
    });

    return () => socket.off('newMessage');
  }, [socket]);

  const handleClick = () => {
    setCount(0);
    Notification.requestPermission();
  };

  return (
    <>
      <Toaster position="top-right" />
      <button
        onClick={handleClick}
        title="Notifications"
        style={{
          position: 'relative',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px',
          width: '40px',
          height: '40px',
          fontSize: '18px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s',
        }}
      >
        🔔
        {count > 0 && (
          <span style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            background: '#ef4444',
            color: '#fff',
            fontSize: '10px',
            fontWeight: '700',
            borderRadius: '20px',
            padding: '1px 5px',
            minWidth: '18px',
            textAlign: 'center',
            border: '2px solid #1e1e2e',
          }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>
    </>
  );
}