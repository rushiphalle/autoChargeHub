import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface StationStats {
  totalStations: number;
  totalBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeBookings: number;
}

const StationOwnerDashboard: React.FC = () => {
  const [stats, setStats] = useState<StationStats>({
    totalStations: 0,
    totalBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeBookings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [stationsResponse, bookingsResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/stations/owner/my-stations'),
        axios.get('http://localhost:5000/api/bookings')
      ]);

      const stations = stationsResponse.data;
      const bookings = bookingsResponse.data.bookings || bookingsResponse.data;

      // Calculate stats
      const totalStations = stations.length;
      const totalBookings = bookings.length;
      const activeBookings = bookings.filter((b: any) => 
        b.status === 'booked' || b.status === 'in_progress'
      ).length;
      
      const totalRevenue = bookings
        .filter((b: any) => b.paymentStatus === 'completed')
        .reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);

      const monthlyRevenue = bookings
        .filter((b: any) => {
          const bookingDate = new Date(b.createdAt);
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          return bookingDate.getMonth() === currentMonth && 
                 bookingDate.getFullYear() === currentYear &&
                 b.paymentStatus === 'completed';
        })
        .reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);

      setStats({
        totalStations,
        totalBookings,
        totalRevenue,
        monthlyRevenue,
        activeBookings
      });
    } catch (err: any) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="loading">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="alert alert-danger">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Overview of your charging stations and bookings</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🏪</div>
            <div className="stat-content">
              <h3>{stats.totalStations}</h3>
              <p>Total Stations</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{stats.totalBookings}</h3>
              <p>Total Bookings</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
              <p>Total Revenue</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>₹{stats.monthlyRevenue.toLocaleString()}</h3>
              <p>This Month</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <h3>{stats.activeBookings}</h3>
              <p>Active Bookings</p>
            </div>
          </div>
        </div>

        <div className="dashboard-actions">
          <Link to="/station-owner/stations" className="btn btn-primary">
            Manage Stations
          </Link>
          <Link to="/station-owner/bookings" className="btn btn-outline">
            View Bookings
          </Link>
        </div>

        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">📅</div>
              <div className="activity-content">
                <h4>New booking received</h4>
                <p>Station A - Slot 2</p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">💰</div>
              <div className="activity-content">
                <h4>Payment received</h4>
                <p>₹150 from John Doe</p>
                <span className="activity-time">4 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">🏪</div>
              <div className="activity-content">
                <h4>Station updated</h4>
                <p>Station B availability changed</p>
                <span className="activity-time">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard {
          min-height: 100vh;
          background: #f8f9fa;
          padding: 2rem 0;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .dashboard-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .dashboard-header p {
          color: #666;
          font-size: 1.1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          font-size: 2rem;
        }

        .stat-content h3 {
          font-size: 2rem;
          font-weight: 700;
          color: #333;
          margin: 0;
        }

        .stat-content p {
          color: #666;
          margin: 0;
          font-size: 0.9rem;
        }

        .dashboard-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 3rem;
        }

        .recent-activity {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .recent-activity h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 1.5rem;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .activity-icon {
          font-size: 1.5rem;
        }

        .activity-content h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 0.25rem 0;
        }

        .activity-content p {
          color: #666;
          margin: 0 0 0.25rem 0;
          font-size: 0.9rem;
        }

        .activity-time {
          color: #999;
          font-size: 0.8rem;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default StationOwnerDashboard;