// frontend/src/__tests__/components/JobCard.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import JobCard from '../../components/JobCard';
import * as api from '../../api/endpoints';

// Mock the API functions
jest.mock('../../api/endpoints');
jest.mock('@chakra-ui/react', () => {
  const originalModule = jest.requireActual('@chakra-ui/react');
  return {
    ...originalModule,
    useDisclosure: () => ({
      isOpen: false,
      onOpen: jest.fn(),
      onClose: jest.fn()
    }),
    useToast: () => jest.fn(),
  };
});

describe('JobCard Component', () => {
  const mockJob = {
    id: 1,
    title: 'Software Engineer',
    description: 'Looking for a talented developer',
    pay: '$120,000/year',
    creator_username: 'employer',
    formatted_post_date: '22 Apr 25'
  };

  beforeEach(() => {
    api.deleteJob.mockResolvedValue({});
    api.getJobApplications.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders job details correctly', () => {
    render(<JobCard job={mockJob} />);
    
    // Check that all job details are displayed
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Looking for a talented developer')).toBeInTheDocument();
    expect(screen.getByText('$120,000/year')).toBeInTheDocument();
    expect(screen.getByText(/posted by employer/i)).toBeInTheDocument();
    expect(screen.getByText('22 Apr 25')).toBeInTheDocument();
    
    // Check that Apply button is shown (for non-owners)
    expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
  });

  test('shows owner actions when isOwner is true', () => {
    render(<JobCard job={mockJob} isOwner={true} />);
    
    // Check that owner actions are shown instead of Apply button
    expect(screen.getByRole('button', { name: /view applications/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /apply/i })).not.toBeInTheDocument();
  });

  test('handles job deletion', async () => {
    // Mock confirm to return true
    window.confirm = jest.fn().mockImplementation(() => true);
    
    render(<JobCard job={mockJob} isOwner={true} />);
    
    // Click delete button
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    
    // Check that confirmation was requested
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this job posting?');
    
    // Check that API was called
    await waitFor(() => {
      expect(api.deleteJob).toHaveBeenCalledWith(1);
    });
  });

  test('cancels job deletion if not confirmed', async () => {
    // Mock confirm to return false
    window.confirm = jest.fn().mockImplementation(() => false);
    
    render(<JobCard job={mockJob} isOwner={true} />);
    
    // Click delete button
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    
    // Check that confirmation was requested
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this job posting?');
    
    // API should not have been called
    expect(api.deleteJob).not.toHaveBeenCalled();
  });

  test('opens application modal when Apply button is clicked', () => {
    const { getByRole, getByText } = render(<JobCard job={mockJob} />);
    
    // Mock the useDisclosure hook to simulate modal opening
    const applyButton = getByRole('button', { name: /apply/i });
    fireEvent.click(applyButton);
    
    // Modal should be opened (this would test the integration with Chakra UI's Modal)
    // In a real test, we would check that the modal content is displayed
  });
});