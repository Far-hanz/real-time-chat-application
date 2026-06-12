import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import useAuth from '../hooks/useAuth';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register({ name: form.name.trim(), email: form.email, password: form.password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create your account. Is the server running?');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Join the conversation"
      title="Claim your handle."
      subtitle="One account — every chat, group, and ping."
      footer={
        <>
          Already have an account? <Link to="/login">Sign in</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="How should people see you?"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field-grid">
          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="field-password">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="6+ characters"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'hide' : 'show'}
              </button>
            </div>
          </div>

          <div className="field">
            <label htmlFor="confirm">Confirm</label>
            <input
              id="confirm"
              name="confirm"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repeat it"
              value={form.confirm}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? <span className="btn-spinner" aria-hidden="true" /> : null}
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
}
