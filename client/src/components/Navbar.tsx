import React, { useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  LayoutDashboard, 
  MapPin, 
  Calendar, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Zap,
  Car
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getRoleBasedLinks = () => {
    if (!user) return [];

    if (user.role === 'station_owner') {
      return [
        { path: '/station-owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/station-owner/stations', label: 'My Stations', icon: Zap },
        { path: '/station-owner/bookings', label: 'My Bookings', icon: Calendar },
        { path: '/station-owner/profile', label: 'Profile', icon: User }
      ];
    } else {
      return [
        { path: '/ev-owner/services', label: 'Services', icon: Car },
        { path: '/ev-owner/bookings', label: 'My Bookings', icon: Calendar },
        { path: '/ev-owner/profile', label: 'Profile', icon: User }
      ];
    }
  };

  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // We close via backdrop and link clicks to avoid premature closes on some devices.

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <div className="brand-icon">
              <Zap size={28} />
            </div>
            <div className="brand-text">
              <h2>AutoCharge</h2>
              <span>Hub</span>
            </div>
          </Link>

          {/* Backdrop overlay for mobile when menu is open */}
          {isMenuOpen && (
            <div
              className="navbar-backdrop"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(false);
              }}
            />
          )}

          <div
            ref={menuRef}
            className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="navbar-links">
              <Link 
                to="/" 
                className={`navbar-link ${isActive('/') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Home size={18} />
                <span>Home</span>
              </Link>

              {user ? (
                <>
                  {getRoleBasedLinks().map((link) => {
                    const IconComponent = link.icon;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`navbar-link ${isActive(link.path) ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <IconComponent size={18} />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                  
                  <div className="navbar-user">
                    <div className="user-info">
                      <div className="user-avatar">
                        <User size={20} />
                      </div>
                      <div className="user-details">
                        <span className="user-name">{user.name}</span>
                        <span className="user-role">{user.role === 'station_owner' ? 'Station Owner' : 'EV Owner'}</span>
                      </div>
                    </div>
                    <button 
                      className="btn btn-outline btn-sm logout-btn"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className={`navbar-link ${isActive('/login') ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={18} />
                    <span>Login</span>
                  </Link>
                  <Link 
                    to="/register" 
                    className={`navbar-link ${isActive('/register') ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings size={18} />
                    <span>Register</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          <button 
            className="navbar-toggle"
            ref={toggleRef}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsMenuOpen(prev => !prev);
            }}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            type="button"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <style>{`
        .navbar {
          background: rgba(248, 250, 252, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(226, 232, 240, 0.5);
          position: sticky;
          top: 0;
          z-index: 1000;
          transition: all var(--transition-normal);
        }

        .navbar-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 0;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          transition: all var(--transition-normal);
        }

        .navbar-brand:hover {
          transform: translateY(-1px);
        }

        .brand-icon {
          width: 3rem;
          height: 3rem;
          background: linear-gradient(135deg, var(--primary-green), var(--primary-green-light));
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
        }

        .brand-text h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--primary-green), var(--accent-teal));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .brand-text span {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .navbar-menu {
          display: flex;
          align-items: center;
          z-index: 1002;
        }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .navbar-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          color: var(--text-secondary);
          font-weight: 600;
          padding: 0.75rem 1.25rem;
          border-radius: var(--radius-xl);
          transition: all var(--transition-normal);
          position: relative;
          background: transparent;
        }

        .navbar-link:hover {
          color: var(--primary-green);
          background: rgba(16, 185, 129, 0.1);
          transform: translateY(-2px);
        }

        .navbar-link.active {
          color: white;
          background: linear-gradient(135deg, var(--primary-green), var(--primary-green-light));
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
        }

        .navbar-user {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-left: 1.5rem;
          padding-left: 1.5rem;
          border-left: 1px solid var(--surface-tertiary);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 2.5rem;
          height: 2.5rem;
          background: linear-gradient(135deg, var(--primary-green), var(--primary-green-light));
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);
        }

        .user-details {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .user-name {
          color: var(--text-primary);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .user-role {
          color: var(--text-muted);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .logout-btn {
          padding: 0.5rem 1rem !important;
          font-size: 0.875rem !important;
        }

        .navbar-toggle {
          display: none;
          background: var(--surface-primary);
          border: none;
          border-radius: var(--radius-lg);
          cursor: pointer;
          padding: 0.75rem;
          color: var(--text-primary);
          box-shadow: var(--neuro-shadow-light);
          transition: all var(--transition-normal);
          z-index: 1003;
        }

        .navbar-toggle:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .navbar-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1001;
          pointer-events: auto;
        }

        @media (max-width: 768px) {
          .navbar-menu {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(248, 250, 252, 0.98);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid var(--surface-tertiary);
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all var(--transition-normal);
            z-index: 1002;
            max-height: 80vh;
            overflow-y: auto;
          }

          .navbar-menu.active {
            transform: translateY(0) !important;
            opacity: 1 !important;
            visibility: visible !important;
          }

          .navbar-links {
            flex-direction: column;
            padding: 2rem 1.5rem;
            gap: 0.75rem;
            width: 100%;
          }

          .navbar-link {
            width: 100%;
            justify-content: flex-start;
            padding: 1rem 1.25rem;
          }

          .navbar-user {
            margin-left: 0;
            padding-left: 0;
            border-left: none;
            border-top: 1px solid var(--surface-tertiary);
            padding-top: 1.5rem;
            flex-direction: column;
            gap: 1rem;
            width: 100%;
          }

          .user-info {
            justify-content: center;
          }

          .logout-btn {
            width: 100%;
            justify-content: center;
          }

          .navbar-toggle {
            display: flex;
          }

          .brand-text h2 {
            font-size: 1.25rem;
          }

          .navbar-content {
            padding: 1rem 0;
          }
        }

        @media (max-width: 480px) {
          .navbar-brand {
            gap: 0.5rem;
          }

          .brand-icon {
            width: 2.5rem;
            height: 2.5rem;
          }

          .brand-text h2 {
            font-size: 1.125rem;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;





