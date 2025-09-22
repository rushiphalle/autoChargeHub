import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const StationOwnerProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bankDetails: {
      accountNumber: user?.bankDetails?.accountNumber || '',
      bankName: user?.bankDetails?.bankName || '',
      ifscCode: user?.bankDetails?.ifscCode || '',
      accountHolderName: user?.bankDetails?.accountHolderName || ''
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('bankDetails.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      bankDetails: {
        accountNumber: user?.bankDetails?.accountNumber || '',
        bankName: user?.bankDetails?.bankName || '',
        ifscCode: user?.bankDetails?.ifscCode || '',
        accountHolderName: user?.bankDetails?.accountHolderName || ''
      }
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="page-header">
          <h1>My Profile</h1>
          <p>Manage your account information and bank details</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="profile-content">
          <div className="profile-card">
            <div className="card-header">
              <h2>Personal Information</h2>
              {!isEditing && (
                <button 
                  className="btn btn-outline"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    required
                    disabled={true}
                  />
                  <small className="form-help">Email cannot be changed</small>
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address" className="form-label">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-textarea"
                    rows={3}
                    disabled={loading}
                  />
                </div>

                <div className="bank-details-section">
                  <h3>Bank Details</h3>
                  
                  <div className="form-group">
                    <label htmlFor="bankDetails.accountHolderName" className="form-label">Account Holder Name</label>
                    <input
                      type="text"
                      id="bankDetails.accountHolderName"
                      name="bankDetails.accountHolderName"
                      value={formData.bankDetails.accountHolderName}
                      onChange={handleChange}
                      className="form-input"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="bankDetails.accountNumber" className="form-label">Account Number</label>
                    <input
                      type="text"
                      id="bankDetails.accountNumber"
                      name="bankDetails.accountNumber"
                      value={formData.bankDetails.accountNumber}
                      onChange={handleChange}
                      className="form-input"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="bankDetails.bankName" className="form-label">Bank Name</label>
                    <input
                      type="text"
                      id="bankDetails.bankName"
                      name="bankDetails.bankName"
                      value={formData.bankDetails.bankName}
                      onChange={handleChange}
                      className="form-input"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="bankDetails.ifscCode" className="form-label">IFSC Code</label>
                    <input
                      type="text"
                      id="bankDetails.ifscCode"
                      name="bankDetails.ifscCode"
                      value={formData.bankDetails.ifscCode}
                      onChange={handleChange}
                      className="form-input"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-display">
                <div className="info-group">
                  <label>Full Name</label>
                  <p>{user?.name}</p>
                </div>

                <div className="info-group">
                  <label>Email</label>
                  <p>{user?.email}</p>
                </div>

                <div className="info-group">
                  <label>Role</label>
                  <p>Station Owner</p>
                </div>

                <div className="info-group">
                  <label>Phone</label>
                  <p>{user?.phone || 'Not provided'}</p>
                </div>

                <div className="info-group">
                  <label>Address</label>
                  <p>{user?.address || 'Not provided'}</p>
                </div>

                {user?.bankDetails && (
                  <div className="bank-details-display">
                    <h3>Bank Details</h3>
                    
                    <div className="info-group">
                      <label>Account Holder Name</label>
                      <p>{user.bankDetails.accountHolderName || 'Not provided'}</p>
                    </div>

                    <div className="info-group">
                      <label>Account Number</label>
                      <p>{user.bankDetails.accountNumber ? `****${user.bankDetails.accountNumber.slice(-4)}` : 'Not provided'}</p>
                    </div>

                    <div className="info-group">
                      <label>Bank Name</label>
                      <p>{user.bankDetails.bankName || 'Not provided'}</p>
                    </div>

                    <div className="info-group">
                      <label>IFSC Code</label>
                      <p>{user.bankDetails.ifscCode || 'Not provided'}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .profile-page {
          min-height: 100vh;
          background: #f8f9fa;
          padding: 2rem 0;
        }

        .page-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .page-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .page-header p {
          color: #666;
          font-size: 1.1rem;
        }

        .profile-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .profile-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 2rem;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eee;
        }

        .card-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .bank-details-section {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #eee;
        }

        .bank-details-section h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 1.5rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .form-help {
          color: #666;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .profile-display {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .info-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-group label {
          font-weight: 600;
          color: #333;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-group p {
          color: #666;
          font-size: 1rem;
          margin: 0;
        }

        .bank-details-display {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #eee;
        }

        .bank-details-display h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 768px) {
          .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default StationOwnerProfile;





