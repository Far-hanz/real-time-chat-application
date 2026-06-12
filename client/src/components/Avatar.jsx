// Avatar with image -> initials fallback and an online-status ring.
// Reusable by the chat UI later (sidebar, headers, group members).
export default function Avatar({ user, size = 'md', showStatus = false }) {
  const initials = (user?.name || '?')
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <span className={`avatar avatar-${size}`} data-online={showStatus ? user?.isOnline : undefined}>
      {user?.avatar ? (
        <img src={user.avatar} alt={user.name} onError={(e) => (e.target.style.display = 'none')} />
      ) : null}
      <span className="avatar-initials" aria-hidden="true">
        {initials}
      </span>
      {showStatus && <span className="avatar-status" aria-hidden="true" />}
    </span>
  );
}
