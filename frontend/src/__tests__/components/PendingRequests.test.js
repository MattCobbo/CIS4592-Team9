// frontend/src/__tests__/components/PendingRequests.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PendingRequests from '../../components/PendingRequests';
import * as api from '../../api/endpoints';

// Mock the API functions and fetch
jest.mock('../../api/endpoints');
global.fetch = jest.fn();

describe('PendingRequests Component', () => {
  const mockOrgId = 1;
  const mockOrganization = {
    id: 1,
    name: 'Test Organization',
    pending_requests: ['user1', 'user2']
  };
  const mockUpdateMembers = jest.fn();

  beforeEach(() => {
    api.getOrganization.mockResolvedValue(mockOrganization);
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true })
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders pending requests correctly', async () => {
    render(<PendingRequests orgId={mockOrgId} onUpdateMembers={mockUpdateMembers} />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(api.getOrganization).toHaveBeenCalledWith(mockOrgId);
    });
    
    // Check heading
    expect(screen.getByText('Pending Join Requests')).toBeInTheDocument();
    
    // Check that pending users are listed
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();
    
    // Check that accept/decline buttons are present for each user
    const acceptButtons = screen.getAllByRole('button', { name: /accept/i });
    const declineButtons = screen.getAllByRole('button', { name: /decline/i });
    expect(acceptButtons).toHaveLength(2);
    expect(declineButtons).toHaveLength(2);
  });

  test('handles accepting a request', async () => {
    render(<PendingRequests orgId={mockOrgId} onUpdateMembers={mockUpdateMembers} />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(api.getOrganization).toHaveBeenCalledWith(mockOrgId);
    });
    
    // Click accept button for first user
    const acceptButtons = screen.getAllByRole('button', { name: /accept/i });
    fireEvent.click(acceptButtons[0]);
    
    // Check that API was called correctly
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `http://127.0.0.1:8000/api/organization/accept/${mockOrgId}/user1/`,
        expect.objectContaining({
          method: "POST",
          credentials: "include"
        })
      );
      expect(mockUpdateMembers).toHaveBeenCalled();
    });
    
    // User should be removed from the list
    expect(screen.queryByText('user1')).not.toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();
  });

  test('handles API errors gracefully', async () => {
    // Mock an API error
    global.fetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ error: 'Something went wrong' })
    });
    
    render(<PendingRequests orgId={mockOrgId} onUpdateMembers={mockUpdateMembers} />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(api.getOrganization).toHaveBeenCalledWith(mockOrgId);
    });
    
    // Click accept button
    const acceptButtons = screen.getAllByRole('button', { name: /accept/i });
    fireEvent.click(acceptButtons[0]);
    
    // Check that API was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      // Update callback should not be called on error
      expect(mockUpdateMembers).not.toHaveBeenCalled();
    });
  });

  test('displays message when there are no pending requests', async () => {
    // Mock empty pending requests
    api.getOrganization.mockResolvedValue({
      ...mockOrganization,
      pending_requests: []
    });
    
    render(<PendingRequests orgId={mockOrgId} onUpdateMembers={mockUpdateMembers} />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(api.getOrganization).toHaveBeenCalledWith(mockOrgId);
    });
    
    // Check for no requests message
    expect(screen.getByText('No pending requests')).toBeInTheDocument();
  });
});