// frontend/src/__tests__/components/UserOrganizations.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserOrganizations from '../../components/UserOrganizations';
import * as api from '../../api/endpoints';

// Mock the API functions
jest.mock('../../api/endpoints');

describe('UserOrganizations Component', () => {
  const mockOrganizations = [
    {
      id: 1,
      name: 'Test Organization 1',
      bio: 'This is test organization 1'
    },
    {
      id: 2,
      name: 'Test Organization 2',
      bio: 'This is test organization 2'
    }
  ];

  beforeEach(() => {
    api.getUserOrganizations.mockResolvedValue(mockOrganizations);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders button to view organizations', () => {
    render(<UserOrganizations />);
    
    const viewButton = screen.getByRole('button', { name: /view my organizations/i });
    expect(viewButton).toBeInTheDocument();
  });

  test('toggles organization list on button click', async () => {
    render(<UserOrganizations />);
    
    // Initially, organizations are not shown
    expect(screen.queryByText('Organizations You Joined')).not.toBeInTheDocument();
    
    // Click to show organizations
    const viewButton = screen.getByRole('button', { name: /view my organizations/i });
    fireEvent.click(viewButton);
    
    // Check that heading appears and API was called
    await waitFor(() => {
      expect(api.getUserOrganizations).toHaveBeenCalled();
      expect(screen.getByText('Organizations You Joined')).toBeInTheDocument();
    });
    
    // Organizations should be listed
    expect(screen.getByText('Test Organization 1')).toBeInTheDocument();
    expect(screen.getByText('Test Organization 2')).toBeInTheDocument();
    
    // Click again to hide organizations
    fireEvent.click(screen.getByRole('button', { name: /hide organizations/i }));
    
    // Organizations should no longer be shown
    expect(screen.queryByText('Organizations You Joined')).not.toBeInTheDocument();
  });

  test('displays "No organizations found" when list is empty', async () => {
    api.getUserOrganizations.mockResolvedValue([]);
    
    render(<UserOrganizations />);
    
    // Click to show organizations
    const viewButton = screen.getByRole('button', { name: /view my organizations/i });
    fireEvent.click(viewButton);
    
    // Should show empty state message
    await waitFor(() => {
      expect(screen.getByText('No organizations found.')).toBeInTheDocument();
    });
  });
});