// frontend/src/__tests__/components/Post.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Post from '../../components/post';
import * as api from '../../api/endpoints';

// Mock the API functions
jest.mock('../../api/endpoints');
jest.mock('../../constants/constants', () => ({
  SERVER_URL: 'http://test-server.com/api'
}));

describe('Post Component', () => {
  const mockPostProps = {
    id: 1,
    username: 'testuser',
    description: 'Test post description',
    formatted_date: '01 Jan 24',
    like_count: 10,
    liked: false
  };

  const mockUserData = {
    profile_image: '/profile_image/test.jpg',
    follower_count: 100
  };

  beforeEach(() => {
    api.get_user_profile_data.mockResolvedValue(mockUserData);
    api.toggleLike.mockResolvedValue({ now_liked: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders post content correctly', async () => {
    render(<Post {...mockPostProps} />);

    // Wait for user data to load
    await waitFor(() => {
      expect(api.get_user_profile_data).toHaveBeenCalledWith('testuser');
    });

    // Check basic post content
    expect(screen.getByText('@testuser')).toBeInTheDocument();
    expect(screen.getByText('Test post description')).toBeInTheDocument();
    expect(screen.getByText('01 Jan 24')).toBeInTheDocument();
    expect(screen.getByText('Likes : 10')).toBeInTheDocument();
  });

  test('handles like button click', async () => {
    render(<Post {...mockPostProps} />);

    // Wait for user data to load
    await waitFor(() => {
      expect(api.get_user_profile_data).toHaveBeenCalledWith('testuser');
    });

    // Find and click the like button
    const likeButton = screen.getByRole('button', { name: /like/i });
    fireEvent.click(likeButton);

    // Check that API was called and state was updated
    await waitFor(() => {
      expect(api.toggleLike).toHaveBeenCalledWith(1);
      expect(screen.getByText('Likes : 11')).toBeInTheDocument();
    });
  });

  test('displays profile image correctly', async () => {
    render(<Post {...mockPostProps} />);

    // Wait for user data to load
    await waitFor(() => {
      expect(api.get_user_profile_data).toHaveBeenCalledWith('testuser');
    });

    // Check profile image
    const profileImage = screen.getByRole('img');
    expect(profileImage).toHaveAttribute('src', 'http://test-server.com/api/profile_image/test.jpg');
  });
});