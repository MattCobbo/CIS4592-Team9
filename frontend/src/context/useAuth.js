import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { get_auth, login } from '../api/endpoints';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [auth, setAuth] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const authCheckTimeoutRef = useRef(null);
    const lastPathRef = useRef("");
    const navigate = useNavigate();

    const check_auth = async () => {
        try {
            await get_auth();
            setAuth(true);
        } catch {
            setAuth(false);
        } finally {
            setAuthLoading(false);
        }
    }

    const auth_login = async (username, password) => {
        const data = await login(username, password);
        if (data.success) {
            setAuth(true);
            const userData = {
                "username": data.user.username,
                "bio": data.user.bio,
                "email": data.user.email,
                "first_name": data.user.first_name,
                "last_name": data.user.last_name,
            };
            localStorage.setItem('userData', JSON.stringify(userData));
            navigate(`/${username}`);
        } else {
            alert('invalid username or password');
        }
    }

    useEffect(() => {
        // Get current path
        const currentPath = window.location.pathname;
        
        // Only check auth if path has changed
        if (currentPath !== lastPathRef.current) {
            lastPathRef.current = currentPath;
            
            // Clear any pending timeout
            if (authCheckTimeoutRef.current) {
                clearTimeout(authCheckTimeoutRef.current);
            }
            
            // Set a small delay to avoid multiple checks during rapid navigation
            authCheckTimeoutRef.current = setTimeout(() => {
                check_auth();
            }, 100);
        }
        
        // Cleanup on unmount
        return () => {
            if (authCheckTimeoutRef.current) {
                clearTimeout(authCheckTimeoutRef.current);
            }
        };
    }, [window.location.pathname]);

    return (
        <AuthContext.Provider value={{auth, authLoading, auth_login}}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);