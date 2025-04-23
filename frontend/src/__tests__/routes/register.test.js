// frontend/src/__tests__/routes/register.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Register from '../../routes/register';
import * as api from '../../api/endpoints';

// Mock the API functions
jest.mock('../../api/endpoints');

// Mock window.alert
window.alert = jest.fn();

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Register Component', () => {
  beforeEach(() => {
    api.register.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderRegister = () => {
    return render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
  };

  test('renders register form correctly', () => {
    renderRegister();
    
    // Check for register form elements
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByText('Already have an Account?')).toBeInTheDocument();
  });

  test('handles form input changes', () => {
    renderRegister();
    
    // Type in the form fields
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(firstNameInput, { target: { value: 'Test' } });
    fireEvent.change(lastNameInput, { target: { value: 'User' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    // Check that values were updated
    expect(usernameInput.value).toBe('testuser');
    expect(emailInput.value).toBe('test@example.com');
    expect(firstNameInput.value).toBe('Test');
    expect(lastNameInput.value).toBe('User');
    expect(passwordInput.value).toBe('password123');
    expect(confirmPasswordInput.value).toBe('password123');
  });

  test('navigates to login page when link is clicked', () => {
    renderRegister();
    
    // Click on the login link
    fireEvent.click(screen.getByText('Already have an Account?'));
    
    // Check that navigation was triggered
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('handles successful registration', async () => {
    renderRegister();
    
    // Fill the form
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Check that register API was called with the right data
    await waitFor(() => {
      expect(api.register).toHaveBeenCalledWith(
        'testuser',
        'test@example.com',
        'Test',
        'User',
        'password123'
      );
      expect(window.alert).toHaveBeenCalledWith('Created new account');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('shows error when passwords do not match', async () => {
    renderRegister();
    
    // Fill the form with mismatched passwords
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'differentpassword' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Check that error message was shown
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('passwords do not match');
      expect(api.register).not.toHaveBeenCalled();
    });
  });

  test('handles registration API error', async () => {
    // Mock API to return an error
    api.register.mockRejectedValue(new Error('Registration failed'));
    
    renderRegister();
    
    // Fill the form
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Check that error message was shown
    await waitFor(() => {
      expect(api.register).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('error registering new account');
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});