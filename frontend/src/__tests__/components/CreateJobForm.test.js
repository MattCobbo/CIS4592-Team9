// frontend/src/__tests__/components/CreateJobForm.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateJobForm from '../../components/CreateJobForm';
import * as api from '../../api/endpoints';

// Mock the API functions
jest.mock('../../api/endpoints');
jest.mock('@chakra-ui/react', () => {
  const originalModule = jest.requireActual('@chakra-ui/react');
  return {
    ...originalModule,
    useToast: () => jest.fn(),
  };
});

describe('CreateJobForm Component', () => {
  const mockNewJob = {
    id: 1,
    title: 'Frontend Developer',
    description: 'Seeking a React expert',
    pay: '$100,000/year',
    creator_username: 'testuser',
    post_date: '2025-04-22',
    formatted_post_date: '22 Apr 25'
  };
  
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    api.createJob.mockResolvedValue(mockNewJob);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders form fields correctly', () => {
    render(<CreateJobForm onSuccess={mockOnSuccess} />);
    
    // Check that all form fields are present
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/compensation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /post job/i })).toBeInTheDocument();
  });

  test('handles form submission successfully', async () => {
    render(<CreateJobForm onSuccess={mockOnSuccess} />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/job title/i), {
      target: { value: 'Frontend Developer' }
    });
    
    fireEvent.change(screen.getByLabelText(/compensation/i), {
      target: { value: '$100,000/year' }
    });
    
    fireEvent.change(screen.getByLabelText(/job description/i), {
      target: { value: 'Seeking a React expert' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /post job/i }));
    
    // Check that API was called with correct data
    await waitFor(() => {
      expect(api.createJob).toHaveBeenCalledWith({
        title: 'Frontend Developer',
        description: 'Seeking a React expert',
        pay: '$100,000/year'
      });
      expect(mockOnSuccess).toHaveBeenCalledWith(mockNewJob);
    });
  });

  test('shows validation errors for empty fields', async () => {
    render(<CreateJobForm onSuccess={mockOnSuccess} />);
    
    // Submit the form without filling out fields
    fireEvent.click(screen.getByRole('button', { name: /post job/i }));
    
    // Check that validation errors are shown
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
      expect(screen.getByText(/pay information is required/i)).toBeInTheDocument();
    });
    
    // API should not have been called
    expect(api.createJob).not.toHaveBeenCalled();
  });

  test('handles API errors gracefully', async () => {
    api.createJob.mockRejectedValue(new Error('API Error'));
    
    render(<CreateJobForm onSuccess={mockOnSuccess} />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/job title/i), {
      target: { value: 'Frontend Developer' }
    });
    
    fireEvent.change(screen.getByLabelText(/compensation/i), {
      target: { value: '$100,000/year' }
    });
    
    fireEvent.change(screen.getByLabelText(/job description/i), {
      target: { value: 'Seeking a React expert' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /post job/i }));
    
    // Check that API was called but onSuccess was not
    await waitFor(() => {
      expect(api.createJob).toHaveBeenCalled();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });
});