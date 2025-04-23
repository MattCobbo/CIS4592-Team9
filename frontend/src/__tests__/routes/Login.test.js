// frontend/src/__tests__/routes/login.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../routes/login';
import { AuthProvider } from '../../context/useAuth';

// Mock the useAuth hook
jest.mock('../../context/useAuth', () => {
  const originalModule = jest.requireActual('../../context/useAuth');
  return {
    ...originalModule,
    useAuth: () => ({
      auth_login: jest.fn(),
      auth: false,
      authLoading: false
    })
  };
});

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Login Component', () => {
  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  test('renders login form correctly', () => {
    renderLogin();
    
    // Check for login form elements
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText('Create a new Account')).toBeInTheDocument();
  });

  test('handles form input changes', () => {
    renderLogin();
    
    // Type in the form fields
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Check that values were updated
    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
  });

  test('navigates to register page when link is clicked', () => {
    renderLogin();
    
    // Click on the register link
    fireEvent.click(screen.getByText('Create a new Account'));
    
    // Check that navigation was triggered
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  test('calls auth_login on form submission', () => {
    const { auth_login } = require('../../context/useAuth').useAuth();
    renderLogin();
    
    // Fill the form
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Check that auth_login was called with the right credentials
    expect(auth_login).toHaveBeenCalledWith('testuser', 'password123');
  });
});