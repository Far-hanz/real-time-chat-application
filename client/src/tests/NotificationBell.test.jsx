import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NotificationBell from '../components/Notifications/NotificationBell';

describe('NotificationBell Component', () => {
  it('renders bell icon', () => {
    render(<NotificationBell socket={null} />);
    expect(screen.getByTitle('Notifications')).toBeInTheDocument();
  });

  it('shows bell button', () => {
    render(<NotificationBell socket={null} />);
    const bell = screen.getByTitle('Notifications');
    expect(bell).toBeInTheDocument();
  });

  it('does not show badge when no notifications', () => {
    const { container } = render(<NotificationBell socket={null} />);
    const badge = container.querySelector('.notif-badge');
    expect(badge).not.toBeInTheDocument();
  });
});