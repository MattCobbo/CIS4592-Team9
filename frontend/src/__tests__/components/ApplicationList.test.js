// frontend/src/__tests__/components/ApplicationsList.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ApplicationsList from '../../components/ApplicationsList';

describe('ApplicationsList Component', () => {
  const mockApplications = [
    {
      id: 1,
      applicant_name: 'John Doe',
      applicant_email: 'john@example.com',
      applicant_phone: '555-123-4567',
      requested_pay: '$120,000/year',
      resume_text: 'I am a software developer with 5 years of experience.',
      formatted_application_date: '22 Apr 25'
    },
    {
      id: 2,
      applicant_name: 'Jane Smith',
      applicant_email: 'jane@example.com',
      applicant_phone: '555-987-6543',
      requested_pay: null,
      resume_text: 'I have been coding for 3 years.',
      formatted_application_date: '23 Apr 25'
    }
  ];

  test('renders empty state when no applications', () => {
    render(<ApplicationsList applications={[]} />);
    
    expect(screen.getByText('No applications received yet.')).toBeInTheDocument();
  });

  test('renders applications count correctly', () => {
    render(<ApplicationsList applications={mockApplications} />);
    
    expect(screen.getByText('You have received 2 applications.')).toBeInTheDocument();
  });

  test('renders singular applications count correctly', () => {
    render(<ApplicationsList applications={[mockApplications[0]]} />);
    
    expect(screen.getByText('You have received 1 application.')).toBeInTheDocument();
  });

  test('renders applicant names and dates', () => {
    render(<ApplicationsList applications={mockApplications} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('22 Apr 25')).toBeInTheDocument();
    expect(screen.getByText('23 Apr 25')).toBeInTheDocument();
  });

  test('expands application details when clicked', () => {
    render(<ApplicationsList applications={mockApplications} />);
    
    // Initially, details should not be visible
    expect(screen.queryByText('Email: john@example.com')).not.toBeInTheDocument();
    
    // Click on the first application to expand it
    fireEvent.click(screen.getByText('John Doe'));
    
    // Details should now be visible
    expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Phone: 555-123-4567')).toBeInTheDocument();
    expect(screen.getByText('$120,000/year')).toBeInTheDocument();
    expect(screen.getByText('I am a software developer with 5 years of experience.')).toBeInTheDocument();
  });

  test('handles missing requested pay field', () => {
    render(<ApplicationsList applications={mockApplications} />);
    
    // Expand the second application
    fireEvent.click(screen.getByText('Jane Smith'));
    
    // Should not show requested pay section for the second application
    expect(screen.queryByText('Requested Compensation:')).not.toBeInTheDocument();
  });
});