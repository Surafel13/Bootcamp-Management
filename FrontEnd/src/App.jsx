import { useState } from 'react';
import StudentDashboard from './pages/StudentDashboard';
import Login from './pages/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <>
      {isAuthenticated ? (
        <StudentDashboard onLogout={() => setIsAuthenticated(false)} />
      ) : (
        <Login onLogin={() => setIsAuthenticated(true)} />
      )}
    </>
  );
}

export default App;