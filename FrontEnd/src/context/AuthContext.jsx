import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to extract roles/info from backend response
  const mapBackendUser = (userData) => {
    // Map backend roles to frontend display names if needed
    let displayRole = userData.role;
    if (userData.role === 'super_admin') displayRole = 'Super Admin';
    else if (userData.role === 'division_admin') displayRole = 'Division Admin';
    else if (userData.role === 'instructor') displayRole = 'Instructor';
    else if (userData.role === 'student') displayRole = 'Student';

    const initials = userData.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

    return {
      ...userData,
      displayRole,
      initials,
    };
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // You could optionally verify token with a /me endpoint here
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setRole(parsedUser.displayRole);
        } catch (e) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { token, user: userData } = response.data;
      const mappedUser = mapBackendUser(userData);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(mappedUser));

      setUser(mappedUser);
      setRole(mappedUser.displayRole);
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        message: error.data?.message || 'Invalid email or password' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, setRole, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
