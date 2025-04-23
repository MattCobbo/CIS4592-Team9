// frontend/src/__tests__/context/useAuth.test.js
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useAuth, AuthProvider } from '../../context/useAuth';
import * as api from '../../api/endpoints';

// Mock the API functions
jest.mock('../../api/endpoints');

// Mock localStorage
const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage
});

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

// Mock window.location
delete window.location;
window.location = { pathname: '/' };

// Mock window.alert
window.alert = jest.fn();

describe('useAuth Hook', () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('provides auth context with initial values', async () => {
        api.get_auth.mockRejectedValue(new Error('Not authenticated'));

        const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });

        // Initial loading state
        expect(result.current.auth).toBe(false);
        expect(result.current.authLoading).toBe(true);

        await waitForNextUpdate();

        // After checking auth (failed)
        expect(result.current.auth).toBe(false);
        expect(result.current.authLoading).toBe(false);
    });

    test('sets auth to true when authentication check succeeds', async () => {
        api.get_auth.mockResolvedValue({ status: 'authenticated', username: 'testuser' });

        const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });

        await waitForNextUpdate();

        expect(result.current.auth).toBe(true);
        expect(result.current.authLoading).toBe(false);
    });

    test('handles successful login', async () => {
        const mockUserData = {
            success: true,
            user: {
                username: 'testuser',
                bio: 'Test bio',
                email: 'test@example.com',
                first_name: 'Test',
                last_name: 'User'
            }
        };

        api.login.mockResolvedValue(mockUserData);

        const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });

        // Wait for initial auth check to complete
        await waitForNextUpdate();

        // Call login function
        await act(async () => {
            await result.current.auth_login('testuser', 'password123');
        });

        // Check that API was called correctly
        expect(api.login).toHaveBeenCalledWith('testuser', 'password123');

        // Check that auth state was updated
        expect(result.current.auth).toBe(true);

        // Check that user data was stored in localStorage
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
            'userData',
            JSON.stringify({
                username: 'testuser',
                bio: 'Test bio',
                email: 'test@example.com',
                first_name: 'Test',
                last_name: 'User'
            })
        );

        // Check that navigation happened
        expect(mockNavigate).toHaveBeenCalledWith('/testuser');
    });

    test('handles failed login', async () => {
        const mockFailedResponse = {
            success: false
        };

        api.login.mockResolvedValue(mockFailedResponse);

        const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });

        // Wait for initial auth check to complete
        await waitForNextUpdate();

        // Call login function
        await act(async () => {
            await result.current.auth_login('testuser', 'wrongpassword');
        });

        // Check that API was called correctly
        expect(api.login).toHaveBeenCalledWith('testuser', 'wrongpassword');

        // Check that auth state did not change
        expect(result.current.auth).toBe(false);

        // Check that alert was shown
        expect(window.alert).toHaveBeenCalledWith('invalid username or password');

        // Check that navigation did not happen
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('checks auth again when path changes', async () => {
        api.get_auth.mockResolvedValue({ status: 'authenticated', username: 'testuser' });

        const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });

        // Wait for initial auth check
        await waitForNextUpdate();
        expect(api.get_auth).toHaveBeenCalledTimes(1);

        // Simulate path change
        act(() => {
            window.location.pathname = '/new-path';
            // Trigger a re-render
            window.dispatchEvent(new Event('popstate'));
        });

        // Wait for auth check after path change
        await waitForNextUpdate();

        // Auth should have been checked again
        expect(api.get_auth).toHaveBeenCalledTimes(2);
    });
});