import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, Phone, MapPin, Users, Zap, ArrowRight } from 'lucide-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'ev_owner' as 'ev_owner' | 'station_owner',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
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
            <h1>Join AutoCharge</h1>
            <p>Create your account and start your sustainable journey today</p>
          </div>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name" className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <User size={20} className="input-icon" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your full name"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

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
            </div>

            <div className="form-group">
              <label htmlFor="role" className="form-label">I am a</label>
              <div className="input-wrapper">
                <Users size={20} className="input-icon" />
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-select"
                  required
                  disabled={loading}
                >
                  <option value="ev_owner">🚗 EV Owner</option>
                  <option value="station_owner">⚡ Charging Station Owner</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone" className="form-label">Phone Number (Optional)</label>
                <div className="input-wrapper">
                  <Phone size={20} className="input-icon" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Your phone number"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address" className="form-label">Address (Optional)</label>
                <div className="input-wrapper">
                  <MapPin size={20} className="input-icon" />
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-textarea"
                    placeholder="Your address"
                    rows={3}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
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
                    placeholder="Create a password"
                    required
                    disabled={loading}
                    minLength={6}
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

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <Lock size={20} className="input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Confirm your password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in here
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
          max-width: 600px;
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

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .form-row:last-of-type {
          margin-bottom: 0;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: flex-start;
        }

        .input-icon {
          position: absolute;
          left: 1.25rem;
          top: 1rem;
          color: var(--text-muted);
          z-index: 2;
          pointer-events: none;
        }

        .form-input,
        .form-select {
          padding-left: 3.5rem !important;
          padding-right: 3.5rem !important;
        }

        .form-textarea {
          padding-left: 3.5rem !important;
          padding-right: 1.25rem !important;
          padding-top: 1rem !important;
        }

        .password-toggle {
          position: absolute;
          right: 1.25rem;
          top: 1rem;
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
          margin-top: 1rem;
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

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          box-shadow: var(--neuro-inset-light), 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .auth-card {
            margin: 0 1rem;
            padding: 2rem;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 1rem;
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

          .form-input,
          .form-select {
            padding-left: 3rem !important;
            padding-right: 3rem !important;
          }

          .form-textarea {
            padding-left: 3rem !important;
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

export default Register;





