import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

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

interface Station {
  _id: string;
  name: string;
}

const StationOwnerMyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    station: searchParams.get('station') || '',
    status: searchParams.get('status') || '',
    paymentStatus: searchParams.get('paymentStatus') || ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    fetchStations();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [filters, pagination.currentPage]);

  const fetchStations = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_SERVER_DOMAIN + '/api/stations/owner/my-stations');
      setStations(response.data);
    } catch (err: any) {
      console.error('Fetch stations error:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.station) params.append('station', filters.station);
      if (filters.status) params.append('status', filters.status);
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
      params.append('page', pagination.currentPage.toString());
      params.append('limit', '10');

      const response = await axios.get(process.env.REACT_APP_SERVER_DOMAIN + `api/bookings?${params.toString()}`);
      setBookings(response.data.bookings || response.data);
      setPagination({
        currentPage: response.data.currentPage || 1,
        totalPages: response.data.totalPages || 1,
        total: response.data.total || (response.data.bookings || response.data).length
      });
    } catch (err: any) {
      setError('Failed to load bookings');
      console.error('Fetch bookings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(name, value);
    } else {
      newParams.delete(name);
    }
    setSearchParams(newParams);
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      await axios.put(process.env.REACT_APP_SERVER_DOMAIN + `api/bookings/${bookingId}/status`, { status: newStatus });
      await fetchBookings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update booking status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
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

  if (loading) {
    return (
      <div className="bookings-page">
        <div className="container">
          <div className="loading">Loading bookings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <div className="container">
        <div className="page-header">
          <h1>My Bookings</h1>
          <p>View and manage all bookings for your charging stations</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="bookings-filters">
          <div className="filter-group">
            <label htmlFor="station" className="filter-label">Station</label>
            <select
              id="station"
              name="station"
              value={filters.station}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Stations</option>
              {stations.map(station => (
                <option key={station._id} value={station._id}>
                  {station.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status" className="filter-label">Status</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Statuses</option>
              <option value="booked">Booked</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="paymentStatus" className="filter-label">Payment</label>
            <select
              id="paymentStatus"
              name="paymentStatus"
              value={filters.paymentStatus}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Payments</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        <div className="bookings-summary">
          <div className="summary-card">
            <h3>Total Bookings</h3>
            <p className="summary-number">{pagination.total}</p>
          </div>
          <div className="summary-card">
            <h3>Active Bookings</h3>
            <p className="summary-number">
              {bookings.filter(b => b.status === 'booked' || b.status === 'in_progress').length}
            </p>
          </div>
          <div className="summary-card">
            <h3>Total Revenue</h3>
            <p className="summary-number">
              {formatCurrency(bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0))}
            </p>
          </div>
        </div>

        <div className="bookings-list">
          {bookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No Bookings Found</h3>
              <p>No bookings match your current filters</p>
            </div>
          ) : (
            bookings.map(booking => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <div className="booking-info">
                    <h3>Booking #{booking._id.slice(-8)}</h3>
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
                  <div className="detail-row">
                    <div className="detail-group">
                      <label>Customer</label>
                      <p>{booking.user.name}</p>
                      <small>{booking.user.email}</small>
                      {booking.user.phone && <small>{booking.user.phone}</small>}
                    </div>

                    <div className="detail-group">
                      <label>Slot & Duration</label>
                      <p>Slot {booking.slotNumber}</p>
                      <small>{booking.duration} hours</small>
                    </div>

                    <div className="detail-group">
                      <label>Time</label>
                      <p>{formatDate(booking.startTime)}</p>
                      <small>to {formatDate(booking.endTime)}</small>
                    </div>

                    <div className="detail-group">
                      <label>Amount</label>
                      <p className="amount">{formatCurrency(booking.totalAmount)}</p>
                    </div>
                  </div>

                  {booking.vehicleInfo && (booking.vehicleInfo.make || booking.vehicleInfo.model || booking.vehicleInfo.licensePlate) && (
                    <div className="vehicle-info">
                      <label>Vehicle Information</label>
                      <p>
                        {booking.vehicleInfo.make && booking.vehicleInfo.model 
                          ? `${booking.vehicleInfo.make} ${booking.vehicleInfo.model}`
                          : booking.vehicleInfo.make || booking.vehicleInfo.model
                        }
                        {booking.vehicleInfo.licensePlate && ` - ${booking.vehicleInfo.licensePlate}`}
                      </p>
                    </div>
                  )}

                  {booking.specialRequests && (
                    <div className="special-requests">
                      <label>Special Requests</label>
                      <p>{booking.specialRequests}</p>
                    </div>
                  )}

                  {booking.rating && (
                    <div className="rating-review">
                      <label>Rating & Review</label>
                      <div className="rating">
                        {'★'.repeat(booking.rating)}{'☆'.repeat(5 - booking.rating)}
                        <span className="rating-number">({booking.rating}/5)</span>
                      </div>
                      {booking.review && <p className="review">"{booking.review}"</p>}
                    </div>
                  )}
                </div>

                <div className="booking-actions">
                  <Link 
                    to={`/booking/${booking._id}`}
                    className="btn btn-outline btn-sm"
                  >
                    View Details
                  </Link>
                  
                  {booking.status === 'booked' && (
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => handleStatusUpdate(booking._id, 'in_progress')}
                    >
                      Start Session
                    </button>
                  )}
                  
                  {booking.status === 'in_progress' && (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleStatusUpdate(booking._id, 'completed')}
                    >
                      Complete Session
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button 
              className="btn btn-outline"
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
              disabled={pagination.currentPage === 1}
            >
              Previous
            </button>
            
            <span className="pagination-info">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <button 
              className="btn btn-outline"
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <style>{`
        .bookings-page {
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

        .bookings-filters {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-label {
          font-weight: 500;
          color: #333;
          font-size: 0.875rem;
        }

        .filter-select {
          padding: 0.75rem;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 0.875rem;
          background: white;
        }

        .filter-select:focus {
          outline: none;
          border-color: #007bff;
        }

        .bookings-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .summary-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .summary-card h3 {
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .summary-number {
          font-size: 2rem;
          font-weight: 700;
          color: #333;
          margin: 0;
        }

        .bookings-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: #666;
        }

        .booking-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
        }

        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eee;
        }

        .booking-info h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 0.25rem 0;
        }

        .booking-station {
          color: #666;
          font-size: 0.875rem;
          margin: 0;
        }

        .booking-badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .status-badge, .payment-badge {
          padding: 0.25rem 0.75rem;
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
          margin-bottom: 1.5rem;
        }

        .detail-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1rem;
        }

        .detail-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-group label {
          font-weight: 600;
          color: #333;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-group p {
          color: #333;
          font-size: 1rem;
          margin: 0;
        }

        .detail-group small {
          color: #666;
          font-size: 0.875rem;
        }

        .amount {
          font-weight: 700;
          color: #28a745 !important;
        }

        .vehicle-info, .special-requests, .rating-review {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }

        .vehicle-info label, .special-requests label, .rating-review label {
          font-weight: 600;
          color: #333;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.5rem;
          display: block;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .rating-number {
          font-size: 0.875rem;
          color: #666;
        }

        .review {
          color: #333;
          font-style: italic;
          margin: 0;
        }

        .booking-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 2rem;
        }

        .pagination-info {
          color: #666;
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .bookings-filters {
            grid-template-columns: 1fr;
          }

          .bookings-summary {
            grid-template-columns: 1fr;
          }

          .booking-header {
            flex-direction: column;
            gap: 1rem;
          }

          .detail-row {
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

export default StationOwnerMyBookings;

