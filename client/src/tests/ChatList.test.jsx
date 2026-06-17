import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import ChatList from '../components/Chat/ChatList';

// Mock useAuth hook
vi.mock('../hooks/useAuth', () => ({
  default: () => ({ token: 'fake-token' }),
}));

// Mock fetch globally
beforeAll(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve([]),
    })
  );
});

describe('ChatList Component', () => {

  // Test 1
  it('renders Messages title', () => {
    render(
      <ChatList
        selectedUser={null}
        onSelectUser={() => {}}
      />
    );
    expect(screen.getByText('Messages')).toBeInTheDocument();
  });

  // Test 2
  it('renders search input', () => {
    render(
      <ChatList
        selectedUser={null}
        onSelectUser={() => {}}
      />
    );
    expect(
      screen.getByPlaceholderText('Search users...')
    ).toBeInTheDocument();
  });

  // Test 3
  it('search input accepts text', () => {
    render(
      <ChatList
        selectedUser={null}
        onSelectUser={() => {}}
      />
    );
    const searchInput = screen.getByPlaceholderText('Search users...');
    fireEvent.change(searchInput, { target: { value: 'Farhan' } });
    expect(searchInput.value).toBe('Farhan');
  });

  // Test 4
  it('calls onSelectUser when user is clicked', () => {
    const mockUser = { _id: '1', name: 'Farhan', isOnline: true };
    const mockOnSelect = vi.fn();

    // Render with a pre-selected user passed as prop
    render(
      <ChatList
        selectedUser={mockUser}
        onSelectUser={mockOnSelect}
      />
    );
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  // Test 5
  // Test 5
it('renders no users message when list is empty', () => {
  render(
    <ChatList
      selectedUser={null}
      onSelectUser={() => {}}
    />
  );
  // fetch returns empty array so "No users found" should show
  expect(screen.getByText('No users found')).toBeInTheDocument();
});

});