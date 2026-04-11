import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

// Instead of hardcoding, we can check if window.location has localhost
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'http://13.126.105.203:5000';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetch(`${API_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    logout();
                } else {
                    setUser(data);
                }
            })
            .catch(() => logout())
            .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = (userData, jwtToken) => {
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem('token', jwtToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
    };

    const updateUser = (newUserData) => {
        setUser(newUserData);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, API_URL, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
