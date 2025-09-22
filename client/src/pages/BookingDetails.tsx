import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Booking {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  station: {
    _id: string;
    name: string;
    address: string;
    chargingRate: number;
    owner: {
      _id: string;
      name: string;
      phone: string;
    };
  };
  slotNumber: number;
  startTime: string;
  endTime: string;
  duration: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  status: 'booked' | 'in_progress' | 'completed' | 'cancelled';
  vehicleInfo: {
    make?: string;
    model?: string;
    licensePlate?: string;
  };
  specialRequests?: string;
  rating?: number;
  review?: string;
  createdAt: string;
}

const BookingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBookingDetails();
    }
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(process.env.REACT_APP_SERVER_DOMAIN + `/api/bookings/${id}`);
      setBooking(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load booking details');
      console.error('Fetch booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!booking) return;

    try {
      setActionLoading(true);
      await axios.put(process.env.REACT_APP_SERVER_DOMAIN + `/api/bookings/${booking._id}/status`, { status: newStatus });
      await fetchBookingDetails();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update booking status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;

    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      setActionLoading(true);
      await axios.put(process.env.REACT_APP_SERVER_DOMAIN + `/api/bookings/${booking._id}/cancel`);
      await fetchBookingDetails();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddReview = async (rating: number, review: string) => {
    if (!booking) return;

    try {
      setActionLoading(true);
      await axios.post(process.env.REACT_APP_SERVER_DOMAIN + `/api/bookings/${booking._id}/review`, { rating, review });
      await fetchBookingDetails();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add review');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'booked': return 'status-booked';
      case 'in_progress': return 'status-progress';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  };

  const getPaymentStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed': return 'payment-completed';
      case 'pending': return 'payment-pending';
      case 'failed': return 'payment-failed';
      case 'refunded': return 'payment-refunded';
      default: return 'payment-default';
    }
  };

  const canCancel = (booking: Booking) => {
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const oneHourBefore = new Date(startTime.getTime() - (60 * 60 * 1000));
    return booking.status === 'booked' && now < oneHourBefore;
  };

  const canReview = (booking: Booking) => {
    return booking.status === 'completed' && !booking.rating;
  };

  const canUpdateStatus = (booking: Booking) => {
    if (user?.role === 'station_owner') {
      return booking.status === 'booked' || booking.status === 'in_progress';
    }
    return false;
  };

  if (loading) {
    return (
      <div className="booking-details-page">
        <div className="container">
          <div className="loading">Loading booking details...</div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="booking-details-page">
        <div className="container">
          <div className="error-state">
            <h2>Booking Not Found</h2>
            <p>{error || 'The booking you are looking for does not exist.'}</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-details-page">
      <div className="container">
        <div className="page-header">
          <button 
            className="btn btn-outline"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <h1>Booking Details</h1>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="booking-content">
          <div className="booking-card">
            <div className="booking-header">
              <div className="booking-info">
                <h2>Booking #{booking._id.slice(-8)}</h2>
                <p className="booking-station">{booking.station.name}</p>
              </div>
              <div className="booking-badges">
                <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                  {booking.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`payment-badge ${getPaymentStatusBadgeClass(booking.paymentStatus)}`}>
                  {booking.paymentStatus.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="booking-details">
              <div className="details-grid">
                <div className="detail-section">
                  <h3>Station Information</h3>
                  <div className="detail-item">
                    <label>Station Name</label>
                    <p>{booking.station.name}</p>
                  </div>
                  <div className="detail-item">
                    <label>Address</label>
                    <p>{booking.station.address}</p>
                  </div>
                  <div className="detail-item">
                    <label>Charging Rate</label>
                    <p>₹{booking.station.chargingRate}/hour</p>
                  </div>
                  <div className="detail-item">
                    <label>Station Owner</label>
                    <p>{booking.station.owner.name}</p>
                    {booking.station.owner.phone && (
                      <small>Phone: {booking.station.owner.phone}</small>
                    )}
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Booking Information</h3>
                  <div className="detail-item">
                    <label>Slot Number</label>
                    <p>Slot {booking.slotNumber}</p>
                  </div>
                  <div className="detail-item">
                    <label>Start Time</label>
                    <p>{formatDate(booking.startTime)}</p>
                  </div>
                  <div className="detail-item">
                    <label>End Time</label>
                    <p>{formatDate(booking.endTime)}</p>
                  </div>
                  <div className="detail-item">
                    <label>Duration</label>
                    <p>{booking.duration} hours</p>
                  </div>
                  <div className="detail-item">
                    <label>Total Amount</label>
                    <p className="amount">{formatCurrency(booking.totalAmount)}</p>
                  </div>
                </div>

                {user?.role === 'ev_owner' && (
                  <div className="detail-section">
                    <h3>Customer Information</h3>
                    <div className="detail-item">
                      <label>Name</label>
                      <p>{booking.user.name}</p>
                    </div>
                    <div className="detail-item">
                      <label>Email</label>
                      <p>{booking.user.email}</p>
                    </div>
                    {booking.user.phone && (
                      <div className="detail-item">
                        <label>Phone</label>
                        <p>{booking.user.phone}</p>
                      </div>
                    )}
                  </div>
                )}

                {user?.role === 'station_owner' && (
                  <div className="detail-section">
                    <h3>Customer Information</h3>
                    <div className="detail-item">
                      <label>Name</label>
                      <p>{booking.user.name}</p>
                    </div>
                    <div className="detail-item">
                      <label>Email</label>
                      <p>{booking.user.email}</p>
                    </div>
                    {booking.user.phone && (
                      <div className="detail-item">
                        <label>Phone</label>
                        <p>{booking.user.phone}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {booking.vehicleInfo && (booking.vehicleInfo.make || booking.vehicleInfo.model || booking.vehicleInfo.licensePlate) && (
                <div className="vehicle-info-section">
                  <h3>Vehicle Information</h3>
                  <div className="vehicle-details">
                    {booking.vehicleInfo.make && (
                      <div className="detail-item">
                        <label>Make</label>
                        <p>{booking.vehicleInfo.make}</p>
                      </div>
                    )}
                    {booking.vehicleInfo.model && (
                      <div className="detail-item">
                        <label>Model</label>
                        <p>{booking.vehicleInfo.model}</p>
                      </div>
                    )}
                    {booking.vehicleInfo.licensePlate && (
                      <div className="detail-item">
                        <label>License Plate</label>
                        <p>{booking.vehicleInfo.licensePlate}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {booking.specialRequests && (
                <div className="special-requests-section">
                  <h3>Special Requests</h3>
                  <p>{booking.specialRequests}</p>
                </div>
              )}

              {booking.rating && (
                <div className="rating-section">
                  <h3>Rating & Review</h3>
                  <div className="rating-display">
                    <div className="rating">
                      {'★'.repeat(booking.rating)}{'☆'.repeat(5 - booking.rating)}
                      <span className="rating-number">({booking.rating}/5)</span>
                    </div>
                    {booking.review && (
                      <p className="review">"{booking.review}"</p>
                    )}
                  </div>
                </div>
              )}

              <div className="booking-actions">
                {user?.role === 'ev_owner' && canCancel(booking) && (
                  <button 
                    className="btn btn-danger"
                    onClick={handleCancelBooking}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                )}

                {user?.role === 'ev_owner' && canReview(booking) && (
                  <ReviewModal 
                    onReview={handleAddReview}
                    loading={actionLoading}
                  />
                )}

                {user?.role === 'station_owner' && canUpdateStatus(booking) && (
                  <>
                    {booking.status === 'booked' && (
                      <button 
                        className="btn btn-success"
                        onClick={() => handleStatusUpdate('in_progress')}
                        disabled={actionLoading}
                      >
                        {actionLoading ? 'Starting...' : 'Start Session'}
                      </button>
                    )}
                    
                    {booking.status === 'in_progress' && (
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleStatusUpdate('completed')}
                        disabled={actionLoading}
                      >
                        {actionLoading ? 'Completing...' : 'Complete Session'}
                      </button>
                    )}
                  </>
                )}

                <button 
                  className="btn btn-outline"
                  onClick={() => navigate(-1)}
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .booking-details-page {
          min-height: 100vh;
          background: #f8f9fa;
          padding: 2rem 0;
        }

        .page-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #333;
          margin: 0;
        }

        .booking-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .booking-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 2rem;
          background: #f8f9fa;
          border-bottom: 1px solid #eee;
        }

        .booking-info h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 0.5rem 0;
        }

        .booking-station {
          color: #666;
          font-size: 1rem;
          margin: 0;
        }

        .booking-badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .status-badge, .payment-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-booked {
          background: #fff3cd;
          color: #856404;
        }

        .status-progress {
          background: #d1ecf1;
          color: #0c5460;
        }

        .status-completed {
          background: #d4edda;
          color: #155724;
        }

        .status-cancelled {
          background: #f8d7da;
          color: #721c24;
        }

        .payment-completed {
          background: #d4edda;
          color: #155724;
        }

        .payment-pending {
          background: #fff3cd;
          color: #856404;
        }

        .payment-failed {
          background: #f8d7da;
          color: #721c24;
        }

        .payment-refunded {
          background: #e2e3e5;
          color: #383d41;
        }

        .booking-details {
          padding: 2rem;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .detail-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .detail-section h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #007bff;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-item label {
          font-weight: 600;
          color: #666;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-item p {
          color: #333;
          font-size: 1rem;
          margin: 0;
        }

        .detail-item small {
          color: #666;
          font-size: 0.875rem;
        }

        .amount {
          font-weight: 700;
          color: #28a745 !important;
          font-size: 1.25rem !important;
        }

        .vehicle-info-section, .special-requests-section, .rating-section {
          margin: 2rem 0;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .vehicle-info-section h3, .special-requests-section h3, .rating-section h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 1rem 0;
        }

        .vehicle-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .rating-display {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.25rem;
        }

        .rating-number {
          font-size: 1rem;
          color: #666;
        }

        .review {
          color: #333;
          font-style: italic;
          margin: 0;
        }

        .booking-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #eee;
        }

        .error-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .error-state h2 {
          font-size: 2rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 1rem;
        }

        .error-state p {
          color: #666;
          margin-bottom: 2rem;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .booking-header {
            flex-direction: column;
            gap: 1rem;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }

          .vehicle-details {
            grid-template-columns: 1fr;
          }

          .booking-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

// Review Modal Component
const ReviewModal: React.FC<{
  onReview: (rating: number, review: string) => void;
  loading: boolean;
}> = ({ onReview, loading }) => {
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    try {
      await onReview(rating, review);
      setShowModal(false);
      setRating(0);
      setReview('');
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  return (
    <>
      <button 
        className="btn btn-success"
        onClick={() => setShowModal(true)}
        disabled={loading}
      >
        Add Review
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add Review</h2>
              <button 
                className="btn-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="review-form">
              <div className="form-group">
                <label className="form-label">Rating</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={`star ${star <= rating ? 'active' : ''}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="review" className="form-label">Review (Optional)</label>
                <textarea
                  id="review"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="form-textarea"
                  rows={3}
                  placeholder="Share your experience..."
                />
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={rating === 0 || loading}
                >
                  {loading ? 'Submitting...' : 'Submit Review'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #eee;
        }

        .modal-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .btn-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
        }

        .review-form {
          padding: 1.5rem;
        }

        .rating-input {
          display: flex;
          gap: 0.5rem;
        }

        .star {
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: #ddd;
          transition: color 0.2s ease;
        }

        .star.active {
          color: #ffc107;
        }

        .star:hover {
          color: #ffc107;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }
      `}</style>
    </>
  );
};

export default BookingDetails;

