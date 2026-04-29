import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/parts', label: 'Parts' },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Vehicle Parts</h2>
        </div>
        <nav className="sidebar-nav">
          {links.map(link => (
            <Link 
              key={link.to} 
              to={link.to}
              className={location.pathname === link.to ? 'active' : ''}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p>{user?.email}</p>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}