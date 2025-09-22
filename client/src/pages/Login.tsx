import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg"></div>
      <div className="container">
        <div className="auth-card animate-fade-in">
          <div className="auth-header">
            <div className="auth-logo">
              <Zap size={32} />
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to your EcoCharge Hub account and power your journey</p>
          </div>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          position: relative;
          background: linear-gradient(135deg, var(--primary-green) 0%, var(--accent-teal) 50%, var(--primary-green-light) 100%);
          padding: 2rem 0;
          overflow: hidden;
        }

        .auth-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
          opacity: 0.3;
        }

        .auth-card {
          max-width: 450px;
          margin: 0 auto;
          background: rgba(248, 250, 252, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-2xl);
          box-shadow: var(--shadow-2xl);
          padding: 3rem;
          position: relative;
          z-index: 2;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .auth-logo {
          width: 4rem;
          height: 4rem;
          background: linear-gradient(135deg, var(--primary-green), var(--primary-green-light));
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 1.5rem;
          box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
        }

        .auth-header h1 {
          font-size: 2.25rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--primary-green), var(--accent-teal));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.75rem;
        }

        .auth-header p {
          color: var(--text-secondary);
          font-size: 1rem;
          line-height: 1.6;
        }

        .auth-form {
          margin-bottom: 2rem;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1.25rem;
          color: var(--text-muted);
          z-index: 2;
          pointer-events: none;
        }

        .form-input {
          padding-left: 3.5rem !important;
          padding-right: 3.5rem !important;
        }

        .password-toggle {
          position: absolute;
          right: 1.25rem;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
          z-index: 2;
        }

        .password-toggle:hover {
          color: var(--primary-green);
          background: rgba(16, 185, 129, 0.1);
        }

        .password-toggle:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-full {
          width: 100%;
          padding: 1rem 2rem !important;
          font-size: 1rem !important;
          margin-top: 0.5rem;
        }

        .spinner {
          width: 1.25rem;
          height: 1.25rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .auth-footer {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid var(--surface-tertiary);
        }

        .auth-footer p {
          color: var(--text-secondary);
          margin: 0;
          font-size: 0.875rem;
        }

        .auth-link {
          color: var(--primary-green);
          text-decoration: none;
          font-weight: 600;
          transition: all var(--transition-fast);
        }

        .auth-link:hover {
          color: var(--primary-green-dark);
          text-decoration: underline;
        }

        /* Enhanced form focus states */
        .input-wrapper:focus-within .input-icon {
          color: var(--primary-green);
        }

        .form-input:focus {
          box-shadow: var(--neuro-inset-light), 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .auth-card {
            margin: 0 1rem;
            padding: 2rem;
          }

          .auth-header h1 {
            font-size: 1.875rem;
          }

          .auth-logo {
            width: 3.5rem;
            height: 3.5rem;
          }
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: 1.5rem;
          }

          .auth-header h1 {
            font-size: 1.625rem;
          }

          .auth-logo {
            width: 3rem;
            height: 3rem;
          }

          .form-input {
            padding-left: 3rem !important;
            padding-right: 3rem !important;
          }

          .input-icon {
            left: 1rem;
          }

          .password-toggle {
            right: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;





