import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Prices from './pages/Prices';
import Retailers from './pages/Retailers';
import Supply from './pages/Supply';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = ['/', '/login', '/register'].includes(location.pathname);

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7f6' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        {!isAuthPage && <Sidebar />}
        <main style={{ 
          flex: 1, 
          padding: '80px 40px 40px', 
          marginLeft: isAuthPage ? 0 : '240px',
          transition: 'margin 0.3s ease'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/prices" element={<Prices />} />
          <Route path="/retailers" element={<Retailers />} />
          <Route path="/supply" element={<Supply />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
