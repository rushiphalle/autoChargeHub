import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, 
  Zap, 
  DollarSign, 
  Smartphone, 
  Building2, 
  Shield, 
  UserPlus, 
  MapPin, 
  CreditCard, 
  Battery,
  ArrowRight,
  CheckCircle,
  Star,
  Users
} from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="container">
          <div className="hero-content animate-fade-in">
            <div className="hero-badge">
              <Zap size={16} />
              <span>Sustainable EV Charging Network</span>
            </div>
            <h1>Power Your Journey with <span className="text-gradient">Clean Energy</span></h1>
            <p className="hero-subtitle">
              Discover eco-friendly charging stations, book slots instantly, and join the sustainable transportation revolution. 
              Experience seamless EV charging with our premium network.
            </p>
            
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">Charging Stations</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Happy Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Support</div>
              </div>
            </div>

            {!user ? (
              <div className="hero-actions">
                <Link to="/register" className="btn btn-primary btn-lg">
                  <UserPlus size={20} />
                  <span>Get Started Free</span>
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  <span>Sign In</span>
                  <ArrowRight size={20} />
                </Link>
              </div>
            ) : (
              <div className="hero-actions">
                {user.role === 'station_owner' ? (
                  <Link to="/station-owner/dashboard" className="btn btn-primary btn-lg">
                    <Building2 size={20} />
                    <span>Go to Dashboard</span>
                  </Link>
                ) : (
                  <Link to="/ev-owner/services" className="btn btn-primary btn-lg">
                    <Search size={20} />
                    <span>Find Stations</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose AutoCharge Hub?</h2>
            <p className="section-subtitle">Experience the future of sustainable transportation with our premium EV charging network</p>
          </div>
          <div className="features-grid">
            <div className="feature-card animate-fade-in">
              <div className="feature-icon">
                <Search size={32} />
              </div>
              <h3>Smart Discovery</h3>
              <p>Find charging stations near you with our AI-powered search and interactive map with real-time availability.</p>
              <div className="feature-highlight">
                <CheckCircle size={16} />
                <span>Real-time updates</span>
              </div>
            </div>
            <div className="feature-card animate-fade-in">
              <div className="feature-icon">
                <Zap size={32} />
              </div>
              <h3>Lightning Fast Booking</h3>
              <p>Book charging slots instantly with our streamlined process. Get confirmed in under 30 seconds.</p>
              <div className="feature-highlight">
                <CheckCircle size={16} />
                <span>Instant confirmation</span>
              </div>
            </div>
            <div className="feature-card animate-fade-in">
              <div className="feature-icon">
                <DollarSign size={32} />
              </div>
              <h3>Transparent Pricing</h3>
              <p>See real-time pricing and availability before booking. No hidden charges, just honest pricing.</p>
              <div className="feature-highlight">
                <CheckCircle size={16} />
                <span>No hidden fees</span>
              </div>
            </div>
            <div className="feature-card animate-fade-in">
              <div className="feature-icon">
                <Smartphone size={32} />
              </div>
              <h3>Mobile First Design</h3>
              <p>Access all features on any device with our responsive and intuitive mobile-first interface.</p>
              <div className="feature-highlight">
                <CheckCircle size={16} />
                <span>Cross-platform</span>
              </div>
            </div>
            <div className="feature-card animate-fade-in">
              <div className="feature-icon">
                <Building2 size={32} />
              </div>
              <h3>Station Management</h3>
              <p>For station owners: comprehensive dashboard to manage stations, track bookings, and monitor revenue.</p>
              <div className="feature-highlight">
                <CheckCircle size={16} />
                <span>Analytics included</span>
              </div>
            </div>
            <div className="feature-card animate-fade-in">
              <div className="feature-icon">
                <Shield size={32} />
              </div>
              <h3>Bank-Level Security</h3>
              <p>Safe and secure payment processing with enterprise-grade encryption for all transactions.</p>
              <div className="feature-highlight">
                <CheckCircle size={16} />
                <span>SSL encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Get started in just 4 simple steps</p>
          </div>
          <div className="steps">
            <div className="step animate-fade-in">
              <div className="step-icon">
                <UserPlus size={28} />
              </div>
              <div className="step-number">01</div>
              <h3>Create Account</h3>
              <p>Sign up in seconds as an EV owner or charging station owner. No credit card required to start.</p>
              <div className="step-connector"></div>
            </div>
            <div className="step animate-fade-in">
              <div className="step-icon">
                <MapPin size={28} />
              </div>
              <div className="step-number">02</div>
              <h3>Discover Stations</h3>
              <p>Use our smart search to find nearby charging stations with real-time availability and pricing.</p>
              <div className="step-connector"></div>
            </div>
            <div className="step animate-fade-in">
              <div className="step-icon">
                <CreditCard size={28} />
              </div>
              <div className="step-number">03</div>
              <h3>Book & Pay Securely</h3>
              <p>Select your preferred time slot and complete payment with our secure, encrypted checkout process.</p>
              <div className="step-connector"></div>
            </div>
            <div className="step animate-fade-in">
              <div className="step-icon">
                <Battery size={28} />
              </div>
              <div className="step-number">04</div>
              <h3>Charge & Go</h3>
              <p>Arrive at your booked time, plug in your vehicle, and enjoy fast, reliable charging.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Our Users Say</h2>
            <p className="section-subtitle">Join thousands of satisfied EV owners and station operators</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p>"AutoCharge Hub has revolutionized how I manage my EV charging. The booking system is seamless and the stations are always reliable."</p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <Users size={20} />
                </div>
                <div className="author-info">
                  <span className="author-name">Sarah Johnson</span>
                  <span className="author-role">Tesla Model 3 Owner</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p>"As a station owner, this platform has increased my bookings by 300%. The analytics dashboard is incredibly detailed and helpful."</p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <Users size={20} />
                </div>
                <div className="author-info">
                  <span className="author-name">Michael Chen</span>
                  <span className="author-role">Station Owner</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p>"The mobile app is fantastic! I can find and book charging stations on the go. The real-time availability feature is a game-changer."</p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <Users size={20} />
                </div>
                <div className="author-info">
                  <span className="author-name">Emily Rodriguez</span>
                  <span className="author-role">Nissan Leaf Owner</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-bg"></div>
        <div className="container">
          <div className="cta-content">
            <div className="cta-icon">
              <Zap size={48} />
            </div>
            <h2>Ready to Power Your Journey?</h2>
            <p>Join over 10,000 EV owners and station operators who trust AutoCharge Hub for their charging needs.</p>
            {!user && (
              <div className="cta-actions">
                <Link to="/register" className="btn btn-primary btn-lg">
                  <UserPlus size={20} />
                  <span>Start Free Today</span>
                </Link>
                <div className="cta-note">
                  <CheckCircle size={16} />
                  <span>No credit card required • Free forever</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <style>{`
        .home {
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* Hero Section */
        .hero {
          position: relative;
          background: linear-gradient(135deg, var(--primary-green) 0%, var(--accent-teal) 50%, var(--primary-green-light) 100%);
          color: white;
          padding: 8rem 0 6rem;
          text-align: center;
          overflow: hidden;
        }

        .hero-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
          opacity: 0.3;
        }

        .hero-content {
          position: relative;
          z-index: 2;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: var(--radius-full);
          padding: 0.75rem 1.5rem;
          margin-bottom: 2rem;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .hero-content h1 {
          font-size: 4rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .text-gradient {
          background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.375rem;
          margin-bottom: 3rem;
          opacity: 0.95;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
          font-weight: 400;
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 3rem;
          margin-bottom: 3rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          font-size: 0.875rem;
          opacity: 0.9;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .hero-actions {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* Section Headers */
        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-title {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, var(--primary-green), var(--accent-teal));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .section-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Features Section */
        .features {
          padding: 8rem 0;
          background: var(--surface-primary);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2.5rem;
        }

        .feature-card {
          background: white;
          border-radius: var(--radius-2xl);
          padding: 2.5rem;
          text-align: center;
          box-shadow: var(--neuro-shadow-light);
          transition: all var(--transition-normal);
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--primary-green), var(--primary-green-light));
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-2xl);
        }

        .feature-icon {
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

        .feature-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .feature-card p {
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 1.5rem;
        }

        .feature-highlight {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: var(--primary-green);
          font-size: 0.875rem;
          font-weight: 600;
        }

        /* How It Works Section */
        .how-it-works {
          padding: 8rem 0;
          background: var(--surface-secondary);
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .step {
          position: relative;
          text-align: center;
          background: white;
          border-radius: var(--radius-2xl);
          padding: 2.5rem 2rem;
          box-shadow: var(--neuro-shadow-light);
          transition: all var(--transition-normal);
        }

        .step:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl);
        }

        .step-icon {
          width: 4rem;
          height: 4rem;
          background: linear-gradient(135deg, var(--primary-green), var(--primary-green-light));
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 1rem;
          box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
        }

        .step-number {
          position: absolute;
          top: -1rem;
          right: 1.5rem;
          background: var(--accent-teal);
          color: white;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 700;
          box-shadow: 0 4px 16px rgba(13, 148, 136, 0.3);
        }

        .step h3 {
          font-size: 1.375rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .step p {
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .step-connector {
          display: none;
        }

        /* Testimonials Section */
        .testimonials {
          padding: 8rem 0;
          background: var(--surface-primary);
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2.5rem;
        }

        .testimonial-card {
          background: white;
          border-radius: var(--radius-2xl);
          padding: 2.5rem;
          box-shadow: var(--neuro-shadow-light);
          transition: all var(--transition-normal);
        }

        .testimonial-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl);
        }

        .testimonial-rating {
          display: flex;
          gap: 0.25rem;
          margin-bottom: 1.5rem;
          color: #fbbf24;
        }

        .testimonial-card p {
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 2rem;
          font-style: italic;
          font-size: 1.125rem;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .author-avatar {
          width: 3rem;
          height: 3rem;
          background: linear-gradient(135deg, var(--primary-green), var(--primary-green-light));
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .author-info {
          display: flex;
          flex-direction: column;
        }

        .author-name {
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .author-role {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        /* CTA Section */
        .cta {
          position: relative;
          background: linear-gradient(135deg, var(--primary-green) 0%, var(--accent-teal) 100%);
          color: white;
          padding: 8rem 0;
          text-align: center;
          overflow: hidden;
        }

        .cta-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
        }

        .cta-content {
          position: relative;
          z-index: 2;
        }

        .cta-icon {
          width: 5rem;
          height: 5rem;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .cta-content h2 {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
        }

        .cta-content p {
          font-size: 1.375rem;
          margin-bottom: 3rem;
          opacity: 0.95;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }

        .cta-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .cta-note {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          opacity: 0.9;
          font-weight: 500;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .hero-stats {
            gap: 2rem;
          }

          .features-grid,
          .testimonials-grid {
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .hero {
            padding: 6rem 0 4rem;
          }

          .hero-content h1 {
            font-size: 2.75rem;
          }

          .hero-subtitle {
            font-size: 1.125rem;
          }

          .hero-stats {
            flex-direction: column;
            gap: 1.5rem;
          }

          .hero-actions {
            flex-direction: column;
            align-items: center;
          }

          .section-title {
            font-size: 2.25rem;
          }

          .section-subtitle {
            font-size: 1.125rem;
          }

          .features,
          .how-it-works,
          .testimonials,
          .cta {
            padding: 4rem 0;
          }

          .features-grid,
          .steps,
          .testimonials-grid {
            grid-template-columns: 1fr;
          }

          .feature-card,
          .step,
          .testimonial-card {
            padding: 2rem;
          }

          .cta-content h2 {
            font-size: 2.25rem;
          }

          .cta-content p {
            font-size: 1.125rem;
          }
        }

        @media (max-width: 480px) {
          .hero-content h1 {
            font-size: 2.25rem;
          }

          .hero-badge {
            padding: 0.5rem 1rem;
            font-size: 0.75rem;
          }

          .stat-number {
            font-size: 2rem;
          }

          .section-title {
            font-size: 1.875rem;
          }

          .feature-card,
          .step,
          .testimonial-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;





