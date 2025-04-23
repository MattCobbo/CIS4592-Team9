// frontend/src/__tests__/routes/JobBoard.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import JobBoard from '../../routes/JobBoard';
import * as api from '../../api/endpoints';

// Mock the API functions
jest.mock('../../api/endpoints');

// Mock Chakra UI hooks
jest.mock('@chakra-ui/react', () => {
  const originalModule = jest.requireActual('@chakra-ui/react');
  return {
    ...originalModule,
    useDisclosure: () => ({
      isOpen: false,
      onOpen: jest.fn(),
      onClose: jest.fn()
    }),
    useToast: () => jest.fn()
  };
});

describe('JobBoard Component', () => {
  const mockJobs = {
    results: [
      {
        id: 1,
        title: 'Software Engineer',
        description: 'Looking for a talented developer',
        pay: '$120,000/year',
        creator_username: 'employer',
        formatted_post_date: '22 Apr 25'
      },
      {
        id: 2,
        title: 'Frontend Developer',
        description: 'React expert needed',
        pay: '$100,000/year',
        creator_username: 'anotheremployer',
        formatted_post_date: '21 Apr 25'
      }
    ],
    next: null
  };

  const mockMyJobs = [
    {
      id: 3,
      title: 'Backend Developer',
      description: 'Django expert needed',
      pay: '$110,000/year',
      creator_username: 'currentuser',
      formatted_post_date: '20 Apr 25'
    }
  ];

  beforeEach(() => {
    api.getJobs.mockResolvedValue(mockJobs);
    api.getMyJobs.mockResolvedValue(mockMyJobs);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderJobBoard = () => {
    return render(
      <BrowserRouter>
        <JobBoard />
      </BrowserRouter>
    );
  };

  test('renders job board with all jobs tab by default', async () => {
    renderJobBoard();
    
    // Check for job board title
    expect(screen.getByText('Job Board')).toBeInTheDocument();
    
    // Check for tab buttons
    expect(screen.getByRole('button', { name: /all jobs/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /my jobs/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /post a job/i })).toBeInTheDocument();
    
    // Wait for jobs to load
    await waitFor(() => {
      expect(api.getJobs).toHaveBeenCalledWith(1);
    });
    
    // Check that all jobs are displayed
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
  });

  test('switches to My Jobs tab', async () => {
    renderJobBoard();
    
    // Wait for initial jobs to load
    await waitFor(() => {
      expect(api.getJobs).toHaveBeenCalled();
    });
    
    // Click on My Jobs tab
    fireEvent.click(screen.getByRole('button', { name: /my jobs/i }));
    
    // Should load my jobs
    await waitFor(() => {
      expect(api.getMyJobs).toHaveBeenCalled();
    });
    
    // All Jobs should be hidden and My Jobs should be displayed
    expect(screen.queryByText('Software Engineer')).not.toBeInTheDocument();
    expect(screen.queryByText('Frontend Developer')).not.toBeInTheDocument();
    expect(screen.getByText('Backend Developer')).toBeInTheDocument();
  });

  test('loads more jobs when Load More button is clicked', async () => {
    // Mock next page of results
    const mockNextPage = {
      results: [
        {
          id: 4,
          title: 'Data Scientist',
          description: 'ML expert needed',
          pay: '$130,000/year',
          creator_username: 'employer',
          formatted_post_date: '19 Apr 25'
        }
      ],
      next: null
    };
    
    // First call returns page with next link, second call returns final page
    api.getJobs
      .mockResolvedValueOnce({
        ...mockJobs,
        next: '?page=2'
      })
      .mockResolvedValueOnce(mockNextPage);
    
    renderJobBoard();
    
    // Wait for initial jobs to load
    await waitFor(() => {
      expect(api.getJobs).toHaveBeenCalledWith(1);
    });
    
    // Should show Load More button
    const loadMoreButton = screen.getByRole('button', { name: /load more/i });
    expect(loadMoreButton).toBeInTheDocument();
    
    // Click Load More button
    fireEvent.click(loadMoreButton);
    
    // Should load second page
    await waitFor(() => {
      expect(api.getJobs).toHaveBeenCalledWith(2);
    });
    
    // New job should be displayed
    expect(screen.getByText('Data Scientist')).toBeInTheDocument();
  });

  test('shows empty state when no jobs', async () => {
    // Mock empty results
    api.getJobs.mockResolvedValue({ results: [], next: null });
    api.getMyJobs.mockResolvedValue([]);
    
    renderJobBoard();
    
    // Wait for jobs to load
    await waitFor(() => {
      expect(api.getJobs).toHaveBeenCalled();
    });
    
    // Should show empty state message
    expect(screen.getByText('No jobs found. Be the first to post a job!')).toBeInTheDocument();
    
    // Click on My Jobs tab
    fireEvent.click(screen.getByRole('button', { name: /my jobs/i }));
    
    // Wait for my jobs to load
    await waitFor(() => {
      expect(api.getMyJobs).toHaveBeenCalled();
    });
    
    // Should show empty state message for My Jobs
    expect(screen.getByText("You haven't posted any jobs yet.")).toBeInTheDocument();
  });

  test('opens Post a Job modal when button is clicked', () => {
    renderJobBoard();
    
    // Click on Post a Job button
    fireEvent.click(screen.getByRole('button', { name: /post a job/i }));
    
    // Modal should be opened (this would test the integration with Chakra UI's Modal)
    // In a real test, we would check that the modal content is displayed
  });
});