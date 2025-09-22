import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface ChargingStation {
  _id: string;
  name: string;
  description: string;
  address: string;
  location: {
    coordinates: [number, number];
  };
  totalSlots: number;
  availableSlots: number;
  chargingRate: number;
  amenities: string[];
  operatingHours: {
    open: string;
    close: string;
  };
  owner: {
    name: string;
    phone: string;
  };
}

const AllStationsMap: React.FC = () => {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [filters, setFilters] = useState({
    minRate: '',
    maxRate: '',
    amenities: [] as string[],
    availableSlots: false
  });
  const [filteredStations, setFilteredStations] = useState<ChargingStation[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090]); // Default to Delhi

  const [bookingData, setBookingData] = useState({
    slotNumber: '',
    startTime: '',
    duration: '1',
    vehicleInfo: {
      make: '',
      model: '',
      licensePlate: ''
    },
    specialRequests: ''
  });

  const allAmenities = [
    'WiFi', 'Restroom', 'Coffee Shop', 'Restaurant', 'Parking', 
    'Shopping', 'ATM', 'Waiting Area', 'Food Court', 'Convenience Store'
  ];

  useEffect(() => {
    fetchAllStations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [stations, filters]);

  const fetchAllStations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(process.env.SERVER_DOMAIN + '/api/stations');
      setStations(response.data);
    } catch (err: any) {
      setError('Failed to load charging stations');
      console.error('Fetch stations error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...stations];

    // Filter by rate range
    if (filters.minRate) {
      filtered = filtered.filter(station => station.chargingRate >= parseFloat(filters.minRate));
    }
    if (filters.maxRate) {
      filtered = filtered.filter(station => station.chargingRate <= parseFloat(filters.maxRate));
    }

    // Filter by amenities
    if (filters.amenities.length > 0) {
      filtered = filtered.filter(station => 
        filters.amenities.every(amenity => 
          station.amenities.some(stationAmenity => 
            stationAmenity.toLowerCase().includes(amenity.toLowerCase())
          )
        )
      );
    }

    // Filter by available slots
    if (filters.availableSlots) {
      filtered = filtered.filter(station => station.availableSlots > 0);
    }

    setFilteredStations(filtered);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'availableSlots') {
        setFilters(prev => ({ ...prev, [name]: checked }));
      } else {
        setFilters(prev => ({
          ...prev,
          amenities: checked 
            ? [...prev.amenities, value]
            : prev.amenities.filter(amenity => amenity !== value)
        }));
      }
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleStationSelect = (station: ChargingStation) => {
    setSelectedStation(station);
    setShowBookingForm(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStation) return;

    try {
      const startDateTime = new Date(bookingData.startTime);
      const endDateTime = new Date(startDateTime.getTime() + (parseFloat(bookingData.duration) * 60 * 60 * 1000));

      const bookingPayload = {
        stationId: selectedStation._id,
        slotNumber: parseInt(bookingData.slotNumber),
        startTime: startDateTime.toISOString(),
        duration: parseFloat(bookingData.duration),
        vehicleInfo: bookingData.vehicleInfo,
        specialRequests: bookingData.specialRequests
      };

      const response = await axios.post(process.env.SERVER_DOMAIN + '/api/bookings', bookingPayload);
      
      // Redirect to checkout page
      window.location.href = `/checkout/${response.data.booking._id}`;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create booking');
    }
  };

  const clearFilters = () => {
    setFilters({
      minRate: '',
      maxRate: '',
      amenities: [],
      availableSlots: false
    });
  };

  if (loading) {
    return (
      <div className="all-stations-page">
        <div className="container">
          <div className="loading">Loading all charging stations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="all-stations-page">
      <div className="container">
        <div className="page-header">
          <h1>All Charging Stations</h1>
          <p>Explore all available charging stations across the network</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="filters-section">
          <div className="filters-header">
            <h3>Filter Stations</h3>
            <button 
              className="btn btn-outline btn-sm"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>

          <div className="filters-grid">
            <div className="filter-group">
              <label htmlFor="minRate" className="filter-label">Min Rate (₹/hr)</label>
              <input
                type="number"
                id="minRate"
                name="minRate"
                value={filters.minRate}
                onChange={handleFilterChange}
                className="filter-input"
                placeholder="0"
                min="0"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="maxRate" className="filter-label">Max Rate (₹/hr)</label>
              <input
                type="number"
                id="maxRate"
                name="maxRate"
                value={filters.maxRate}
                onChange={handleFilterChange}
                className="filter-input"
                placeholder="1000"
                min="0"
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Amenities</label>
              <div className="amenities-checkboxes">
                {allAmenities.map(amenity => (
                  <label key={amenity} className="checkbox-label">
                    <input
                      type="checkbox"
                      name="amenity"
                      value={amenity}
                      checked={filters.amenities.includes(amenity)}
                      onChange={handleFilterChange}
                    />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="availableSlots"
                  checked={filters.availableSlots}
                  onChange={handleFilterChange}
                />
                <span>Only show stations with available slots</span>
              </label>
            </div>
          </div>

          <div className="filter-results">
            <p>Showing {filteredStations.length} of {stations.length} stations</p>
          </div>
        </div>

        <div className="map-section">
          <div className="map-container">
            <MapContainer
              center={mapCenter}
              zoom={6}
              style={{ height: '600px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {filteredStations.map(station => (
                <Marker 
                  key={station._id} 
                  position={[station.location.coordinates[1], station.location.coordinates[0]]}
                >
                  <Popup>
                    <div className="station-popup">
                      <h3>{station.name}</h3>
                      <p>{station.address}</p>
                      <p>Rate: ₹{station.chargingRate}/hour</p>
                      <p>Available Slots: {station.availableSlots}/{station.totalSlots}</p>
                      <p>Hours: {station.operatingHours.open} - {station.operatingHours.close}</p>
                      {station.amenities.length > 0 && (
                        <p>Amenities: {station.amenities.join(', ')}</p>
                      )}
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleStationSelect(station)}
                      >
                        Book Now
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="stations-list">
            <h3>Stations List ({filteredStations.length})</h3>
            {filteredStations.length === 0 ? (
              <div className="empty-state">
                <p>No stations match your current filters</p>
                <button 
                  className="btn btn-outline"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="stations-grid">
                {filteredStations.map(station => (
                  <div key={station._id} className="station-card">
                    <div className="station-header">
                      <h4>{station.name}</h4>
                      <div className="station-badges">
                        <span className="rate-badge">₹{station.chargingRate}/hr</span>
                        <span className={`slots-badge ${station.availableSlots > 0 ? 'available' : 'unavailable'}`}>
                          {station.availableSlots}/{station.totalSlots} slots
                        </span>
                      </div>
                    </div>
                    
                    <p className="station-address">{station.address}</p>
                    <p className="station-description">{station.description}</p>
                    
                    <div className="station-details">
                      <div className="detail">
                        <span className="detail-label">Hours:</span>
                        <span>{station.operatingHours.open} - {station.operatingHours.close}</span>
                      </div>
                      <div className="detail">
                        <span className="detail-label">Owner:</span>
                        <span>{station.owner.name}</span>
                      </div>
                    </div>

                    {station.amenities.length > 0 && (
                      <div className="amenities">
                        <span className="amenities-label">Amenities:</span>
                        <div className="amenities-list">
                          {station.amenities.map((amenity, index) => (
                            <span key={index} className="amenity-tag">{amenity}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <button 
                      className="btn btn-primary btn-full"
                      onClick={() => handleStationSelect(station)}
                      disabled={station.availableSlots === 0}
                    >
                      {station.availableSlots > 0 ? 'Book This Station' : 'No Slots Available'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {showBookingForm && selectedStation && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Book Charging Slot - {selectedStation.name}</h2>
                <button 
                  className="btn-close"
                  onClick={() => {
                    setShowBookingForm(false);
                    setSelectedStation(null);
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleBookingSubmit} className="booking-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="slotNumber" className="form-label">Slot Number</label>
                    <select
                      id="slotNumber"
                      value={bookingData.slotNumber}
                      onChange={(e) => setBookingData(prev => ({ ...prev, slotNumber: e.target.value }))}
                      className="form-select"
                      required
                    >
                      <option value="">Select Slot</option>
                      {Array.from({ length: selectedStation.totalSlots }, (_, i) => i + 1).map(slot => (
                        <option key={slot} value={slot}>Slot {slot}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="startTime" className="form-label">Start Time</label>
                    <input
                      type="datetime-local"
                      id="startTime"
                      value={bookingData.startTime}
                      onChange={(e) => setBookingData(prev => ({ ...prev, startTime: e.target.value }))}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="duration" className="form-label">Duration (hours)</label>
                    <select
                      id="duration"
                      value={bookingData.duration}
                      onChange={(e) => setBookingData(prev => ({ ...prev, duration: e.target.value }))}
                      className="form-select"
                      required
                    >
                      <option value="0.5">30 minutes</option>
                      <option value="1">1 hour</option>
                      <option value="2">2 hours</option>
                      <option value="3">3 hours</option>
                      <option value="4">4 hours</option>
                      <option value="6">6 hours</option>
                      <option value="8">8 hours</option>
                    </select>
                  </div>
                </div>

                <div className="vehicle-info-section">
                  <h3>Vehicle Information (Optional)</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="make" className="form-label">Make</label>
                      <input
                        type="text"
                        id="make"
                        value={bookingData.vehicleInfo.make}
                        onChange={(e) => setBookingData(prev => ({ 
                          ...prev, 
                          vehicleInfo: { ...prev.vehicleInfo, make: e.target.value }
                        }))}
                        className="form-input"
                        placeholder="e.g., Tesla"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="model" className="form-label">Model</label>
                      <input
                        type="text"
                        id="model"
                        value={bookingData.vehicleInfo.model}
                        onChange={(e) => setBookingData(prev => ({ 
                          ...prev, 
                          vehicleInfo: { ...prev.vehicleInfo, model: e.target.value }
                        }))}
                        className="form-input"
                        placeholder="e.g., Model 3"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="licensePlate" className="form-label">License Plate</label>
                      <input
                        type="text"
                        id="licensePlate"
                        value={bookingData.vehicleInfo.licensePlate}
                        onChange={(e) => setBookingData(prev => ({ 
                          ...prev, 
                          vehicleInfo: { ...prev.vehicleInfo, licensePlate: e.target.value }
                        }))}
                        className="form-input"
                        placeholder="e.g., ABC1234"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="specialRequests" className="form-label">Special Requests (Optional)</label>
                  <textarea
                    id="specialRequests"
                    value={bookingData.specialRequests}
                    onChange={(e) => setBookingData(prev => ({ ...prev, specialRequests: e.target.value }))}
                    className="form-textarea"
                    rows={3}
                    placeholder="Any special requirements or notes..."
                  />
                </div>

                <div className="booking-summary">
                  <h3>Booking Summary</h3>
                  <div className="summary-details">
                    <div className="summary-row">
                      <span>Station:</span>
                      <span>{selectedStation.name}</span>
                    </div>
                    <div className="summary-row">
                      <span>Rate:</span>
                      <span>₹{selectedStation.chargingRate}/hour</span>
                    </div>
                    <div className="summary-row">
                      <span>Duration:</span>
                      <span>{bookingData.duration} hours</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total Amount:</span>
                      <span>₹{(selectedStation.chargingRate * parseFloat(bookingData.duration)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Proceed to Payment
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowBookingForm(false);
                      setSelectedStation(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .all-stations-page {
          min-height: 100vh;
          background: #f8f9fa;
          padding: 2rem 0;
        }

        .page-header {
          text-align: center;
          margin-bottom: 2rem;
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

        .filters-section {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .filters-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1rem;
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

        .filter-input {
          padding: 0.75rem;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 0.875rem;
        }

        .filter-input:focus {
          outline: none;
          border-color: #007bff;
        }

        .amenities-checkboxes {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.5rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          margin: 0;
        }

        .filter-results {
          text-align: center;
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }

        .filter-results p {
          color: #666;
          font-size: 0.875rem;
          margin: 0;
        }

        .map-section {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .map-container {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .stations-list {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          max-height: 600px;
          overflow-y: auto;
        }

        .stations-list h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 1rem;
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #666;
        }

        .stations-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .station-card {
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 1rem;
          transition: box-shadow 0.3s ease;
        }

        .station-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .station-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }

        .station-header h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .station-badges {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          align-items: flex-end;
        }

        .rate-badge, .slots-badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-weight: 600;
        }

        .rate-badge {
          background: #d4edda;
          color: #155724;
        }

        .slots-badge.available {
          background: #d4edda;
          color: #155724;
        }

        .slots-badge.unavailable {
          background: #f8d7da;
          color: #721c24;
        }

        .station-address {
          color: #666;
          font-size: 0.875rem;
          margin: 0 0 0.5rem 0;
        }

        .station-description {
          color: #333;
          font-size: 0.875rem;
          margin: 0 0 0.75rem 0;
        }

        .station-details {
          margin-bottom: 0.75rem;
        }

        .detail {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          margin-bottom: 0.25rem;
        }

        .detail-label {
          font-weight: 600;
          color: #666;
        }

        .amenities {
          margin-bottom: 0.75rem;
        }

        .amenities-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #666;
          display: block;
          margin-bottom: 0.25rem;
        }

        .amenities-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
        }

        .amenity-tag {
          background: #e9ecef;
          color: #495057;
          padding: 0.125rem 0.375rem;
          border-radius: 8px;
          font-size: 0.625rem;
        }

        .btn-full {
          width: 100%;
          padding: 0.5rem;
          font-size: 0.875rem;
        }

        .btn-full:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

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
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
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

        .booking-form {
          padding: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .vehicle-info-section {
          margin: 2rem 0;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .vehicle-info-section h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 1rem;
        }

        .booking-summary {
          margin: 2rem 0;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .booking-summary h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 1rem;
        }

        .summary-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .summary-row.total {
          font-weight: 600;
          font-size: 1rem;
          padding-top: 0.5rem;
          border-top: 1px solid #ddd;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .station-popup {
          text-align: center;
        }

        .station-popup h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .station-popup p {
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 0.25rem;
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
        }

        @media (max-width: 768px) {
          .map-section {
            grid-template-columns: 1fr;
          }

          .filters-grid {
            grid-template-columns: 1fr;
          }

          .amenities-checkboxes {
            grid-template-columns: repeat(2, 1fr);
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }

          .modal {
            width: 95%;
            margin: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AllStationsMap;

