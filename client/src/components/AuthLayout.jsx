import { Link } from 'react-router-dom';

// Demo conversation rendered on the showcase panel — pure CSS animation.
const DEMO_MESSAGES = [
  { from: 'them', author: 'Farhan', text: 'Sockets are live on the server 🔌' },
  { from: 'me', text: 'Auth is done — register, login, profiles ✅' },
  { from: 'them', author: 'Siri', text: 'Typing indicators coming right up…' },
  { from: 'me', text: 'Ship it. This thing feels instant.' },
];

export default function AuthLayout({ eyebrow, title, subtitle, footer, children }) {
  return (
    <div className="auth-shell">
      <div className="orb orb-a" aria-hidden="true" />
      <div className="orb orb-b" aria-hidden="true" />

      <aside className="auth-showcase" aria-hidden="true">
        <Link to="/" className="wordmark">
          pulse<span className="wordmark-dot" />
        </Link>

        <div className="showcase-thread">
          <p className="thread-stamp">today · 21:47 · #project-chat</p>
          {DEMO_MESSAGES.map((message, index) => (
            <div
              key={index}
              className={`demo-row ${message.from === 'me' ? 'demo-row-me' : ''}`}
              style={{ animationDelay: `${0.55 + index * 0.5}s` }}
            >
              {message.from === 'them' && <span className="demo-presence" />}
              <div className={`demo-bubble ${message.from === 'me' ? 'demo-bubble-me' : ''}`}>
                {message.author && <span className="demo-author">{message.author}</span>}
                {message.text}
              </div>
            </div>
          ))}
          <div className="demo-row demo-typing-row" style={{ animationDelay: '2.9s' }}>
            <span className="demo-presence" />
            <div className="demo-bubble demo-typing">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        </div>

        <p className="showcase-tagline">
          Conversations that land <em>the moment</em> you hit send.
        </p>
      </aside>

      <main className="auth-pane">
        <Link to="/" className="wordmark wordmark-mobile">
          pulse<span className="wordmark-dot" />
        </Link>

        <div className="auth-card">
          <p className="auth-eyebrow">{eyebrow}</p>
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
          {children}
        </div>

        <p className="auth-footer">{footer}</p>
      </main>
    </div>
  );
}
