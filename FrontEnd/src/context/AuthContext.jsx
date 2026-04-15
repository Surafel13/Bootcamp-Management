import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  const login = (email, password) => {
    const emailLower = email.toLowerCase();
    
    if (emailLower === 'admin@bms.com') {
      setUser({
        name: 'Admin Root',
        email: 'admin@bms.com',
        role: 'Super Admin',
        initials: 'AR',
      });
      setRole('Super Admin');
      return true;
    }
    
    if (emailLower === 'instructor@bms.com') {
      setUser({
        name: 'Dr. Sarah Mitchell',
        email: 'instructor@bms.com',
        role: 'Lead Instructor',
        initials: 'SM',
      });
      setRole('Instructor');
      return true;
    }
    
    if (emailLower === 'student@bms.com') {
      setUser({
        name: 'John Doe',
        email: 'student@bms.com',
        role: 'Student',
        initials: 'JD',
      });
      setRole('Student');
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, setRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
