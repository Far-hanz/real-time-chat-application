import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MessageBubble from '../components/Chat/MessageBubble';

const fakeMessage = {
  _id: '1',
  message: 'Hello Deepthi!',
  senderId: 'user123',
  createdAt: new Date().toISOString(),
};

describe('MessageBubble Component', () => {
  it('renders message text', () => {
    render(<MessageBubble message={fakeMessage} isMe={false} />);
    expect(screen.getByText('Hello Deepthi!')).toBeInTheDocument();
  });

  it('renders as their message when isMe is false', () => {
    const { container } = render(
      <MessageBubble message={fakeMessage} isMe={false} />
    );
    expect(container.querySelector('.bubble-them')).toBeInTheDocument();
  });

  it('renders as my message when isMe is true', () => {
    const { container } = render(
      <MessageBubble message={fakeMessage} isMe={true} />
    );
    expect(container.querySelector('.bubble-me')).toBeInTheDocument();
  });
});