import React from 'react';
import { Link } from 'react-router-dom';

const EVOwnerServices: React.FC = () => {
  return (
    <div className="services-page">
      <div className="container">
        <div className="page-header">
          <h1>Our Services</h1>
          <p>Choose from our range of EV charging services</p>
        </div>

        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">📍</div>
            <h3>Nearby Charging Station Finder</h3>
            <p>
              Find charging stations near your current location or any location you specify. 
              Get real-time availability and book instantly with our interactive map.
            </p>
            <div className="service-features">
              <div className="feature">
                <span className="feature-icon">🗺️</span>
                <span>Interactive Map</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📍</span>
                <span>Live Location</span>
              </div>
              <div className="feature">
                <span className="feature-icon">⚡</span>
                <span>Real-time Availability</span>
              </div>
              <div className="feature">
                <span className="feature-icon">💳</span>
                <span>Instant Booking</span>
              </div>
            </div>
            <Link to="/ev-owner/nearby-stations" className="btn btn-primary">
              Find Nearby Stations
            </Link>
          </div>

          <div className="service-card">
            <div className="service-icon">🌍</div>
            <h3>All Charging Stations Map</h3>
            <p>
              Explore all available charging stations across the network. 
              View comprehensive information and book from anywhere in the country.
            </p>
            <div className="service-features">
              <div className="feature">
                <span className="feature-icon">🌐</span>
                <span>Nationwide Coverage</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📊</span>
                <span>Detailed Information</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🔍</span>
                <span>Advanced Search</span>
              </div>
              <div className="feature">
                <span className="feature-icon">⭐</span>
                <span>Ratings & Reviews</span>
              </div>
            </div>
            <Link to="/ev-owner/all-stations" className="btn btn-primary">
              View All Stations
            </Link>
          </div>
        </div>

        <div className="how-it-works">
          <h2>How Our Services Work</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Choose Your Service</h3>
              <p>Select between nearby station finder or browse all stations on the map</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Find & Select</h3>
              <p>Use our interactive map to find the perfect charging station for your needs</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Book & Pay</h3>
              <p>Select your time slot, provide vehicle details, and complete secure payment</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Charge & Go</h3>
              <p>Arrive at your booked time, start charging, and enjoy your journey</p>
            </div>
          </div>
        </div>

        <div className="features-section">
          <h2>Why Choose Our Services?</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <h3>Fast & Reliable</h3>
              <p>Quick booking process with reliable charging infrastructure</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💰</div>
              <h3>Transparent Pricing</h3>
              <p>Clear pricing with no hidden charges or surprise fees</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <h3>Secure Payments</h3>
              <p>Safe and secure payment processing with Stripe integration</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📱</div>
              <h3>Mobile Friendly</h3>
              <p>Optimized for mobile devices with responsive design</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🕐</div>
              <h3>24/7 Availability</h3>
              <p>Book charging slots anytime, anywhere with our online platform</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⭐</div>
              <h3>Quality Assurance</h3>
              <p>Verified stations with user ratings and reviews for quality assurance</p>
            </div>
          </div>
        </div>

        <div className="cta-section">
          <h2>Ready to Start Charging?</h2>
          <p>Join thousands of EV owners who trust our platform for their charging needs</p>
          <div className="cta-actions">
            <Link to="/ev-owner/nearby-stations" className="btn btn-primary btn-lg">
              Find Nearby Stations
            </Link>
            <Link to="/ev-owner/all-stations" className="btn btn-outline btn-lg">
              Browse All Stations
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .services-page {
          min-height: 100vh;
          background: #f8f9fa;
          padding: 2rem 0;
        }

        .page-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .page-header h1 {
          font-size: 3rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 1rem;
        }

        .page-header p {
          font-size: 1.25rem;
          color: #666;
          max-width: 600px;
          margin: 0 auto;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
          margin-bottom: 4rem;
        }

        .service-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          padding: 2.5rem;
          text-align: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .service-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        }

        .service-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
        }

        .service-card h3 {
          font-size: 1.75rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 1rem;
        }

        .service-card p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }

        .service-features {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 8px;
          font-size: 0.9rem;
          color: #333;
        }

        .feature-icon {
          font-size: 1.25rem;
        }

        .how-it-works {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          padding: 3rem;
          margin-bottom: 4rem;
        }

        .how-it-works h2 {
          text-align: center;
          font-size: 2.5rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 3rem;
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .step {
          text-align: center;
          position: relative;
        }

        .step-number {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 auto 1.5rem;
        }

        .step h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 1rem;
        }

        .step p {
          color: #666;
          line-height: 1.6;
        }

        .features-section {
          margin-bottom: 4rem;
        }

        .features-section h2 {
          text-align: center;
          font-size: 2.5rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 3rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .feature-item {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          text-align: center;
          transition: transform 0.3s ease;
        }

        .feature-item:hover {
          transform: translateY(-3px);
        }

        .feature-item .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .feature-item h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 1rem;
        }

        .feature-item p {
          color: #666;
          line-height: 1.6;
        }

        .cta-section {
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          border-radius: 16px;
          padding: 4rem 2rem;
          text-align: center;
        }

        .cta-section h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .cta-section p {
          font-size: 1.25rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        .cta-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-lg {
          padding: 1rem 2rem;
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .page-header h1 {
            font-size: 2.5rem;
          }

          .services-grid {
            grid-template-columns: 1fr;
          }

          .service-card {
            padding: 2rem;
          }

          .service-features {
            grid-template-columns: 1fr;
          }

          .how-it-works {
            padding: 2rem;
          }

          .steps {
            grid-template-columns: 1fr;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .cta-actions {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default EVOwnerServices;

