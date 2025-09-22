import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

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
  isActive: boolean;
  blockedSlots: Array<{
    slotNumber: number;
    startTime: string;
    endTime: string;
    reason: string;
  }>;
  createdAt: string;
}

const StationOwnerMyStations: React.FC = () => {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStation, setEditingStation] = useState<ChargingStation | null>(null);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    totalSlots: '',
    chargingRate: '',
    amenities: [] as string[],
    operatingHours: {
      open: '06:00',
      close: '22:00'
    }
  });

  // marker icon for picker
  delete (Icon.Default.prototype as any)._getIconUrl;
  Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  });
  const pinIcon = divIcon({
    html: '<div style="width:16px;height:16px;border-radius:50%;background:#dc3545;border:2px solid #fff;box-shadow:0 0 2px rgba(0,0,0,0.5);"></div>',
    className: 'color-dot-marker',
    iconSize: [20,20],
    iconAnchor: [10,10]
  });

  const [blockFormData, setBlockFormData] = useState({
    slotNumber: '',
    startTime: '',
    endTime: '',
    reason: ''
  });

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_SERVER_DOMAIN + '/api/stations/owner/my-stations');
      setStations(response.data);
    } catch (err: any) {
      setError('Failed to load stations');
      console.error('Fetch stations error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('operatingHours.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        operatingHours: {
          ...prev.operatingHours,
          [field]: value
        }
      }));
    } else if (name === 'amenities') {
      // handled via multi-select dropdown; ignore plain input
      setFormData(prev => ({ ...prev }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const allAmenities = [
    'WiFi','Restroom','Coffee Shop','Restaurant','Parking','Shopping','ATM','Waiting Area','Food Court','Convenience Store'
  ];

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleBlockInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBlockFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const stationData = {
        ...formData,
        totalSlots: parseInt(formData.totalSlots),
        chargingRate: parseFloat(formData.chargingRate),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };

      if (editingStation) {
        await axios.put(`http://localhost:5000/api/stations/${editingStation._id}`, stationData);
      } else {
        await axios.post(process.env.REACT_APP_SERVER_DOMAIN + '/api/stations', stationData);
      }

      await fetchStations();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save station');
    }
  };

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post(`http://localhost:5000/api/stations/${selectedStation?._id}/block-slots`, {
        ...blockFormData,
        slotNumber: parseInt(blockFormData.slotNumber)
      });

      await fetchStations();
      setShowBlockForm(false);
      setSelectedStation(null);
      setBlockFormData({ slotNumber: '', startTime: '', endTime: '', reason: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to block slot');
    }
  };

  const handleEdit = (station: ChargingStation) => {
    setEditingStation(station);
    setFormData({
      name: station.name,
      description: station.description || '',
      address: station.address,
      latitude: station.location.coordinates[1].toString(),
      longitude: station.location.coordinates[0].toString(),
      totalSlots: station.totalSlots.toString(),
      chargingRate: station.chargingRate.toString(),
      amenities: station.amenities,
      operatingHours: station.operatingHours
    });
    setShowAddForm(true);
  };

  const handleBlockSlot = (station: ChargingStation) => {
    setSelectedStation(station);
    setShowBlockForm(true);
  };

  const handleDelete = async (stationId: string) => {
    if (!window.confirm('Are you sure you want to delete this station?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/stations/${stationId}`);
      await fetchStations();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete station');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      latitude: '',
      longitude: '',
      totalSlots: '',
      chargingRate: '',
      amenities: [],
      operatingHours: { open: '06:00', close: '22:00' }
    });
    setEditingStation(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="stations-page">
        <div className="container">
          <div className="loading">Loading stations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="stations-page">
      <div className="container">
        <div className="page-header">
          <h1>My Charging Stations</h1>
          <p>Manage your charging stations and their availability</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="stations-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            Add New Station
          </button>
        </div>

        {showAddForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>{editingStation ? 'Edit Station' : 'Add New Station'}</h2>
                <button 
                  className="btn-close"
                  onClick={resetForm}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="station-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">Station Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="chargingRate" className="form-label">Charging Rate (₹/hour)</label>
                    <input
                      type="number"
                      id="chargingRate"
                      name="chargingRate"
                      value={formData.chargingRate}
                      onChange={handleInputChange}
                      className="form-input"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address" className="form-label">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                  <div className="form-group">
                  <label className="form-label">Choose Location on Map</label>
                  <div style={{ height: '300px', width: '100%', borderRadius: 8, overflow: 'hidden' }}>
                    <MapContainer center={[formData.latitude ? parseFloat(formData.latitude) : 28.6139, formData.longitude ? parseFloat(formData.longitude) : 77.2090]} zoom={12} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                      <MapClickSetter onPick={(lat: number, lng: number) => setFormData(prev => ({ ...prev, latitude: String(lat), longitude: String(lng) }))} />
                      {formData.latitude && formData.longitude && (
                        <Marker position={[parseFloat(formData.latitude), parseFloat(formData.longitude)]} icon={pinIcon} />
                      )}
                    </MapContainer>
                  </div>
                  <small className="help-text">Pinned: {formData.latitude && formData.longitude ? `${parseFloat(formData.latitude).toFixed(5)}, ${parseFloat(formData.longitude).toFixed(5)}` : 'none'}</small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="totalSlots" className="form-label">Total Slots</label>
                    <input
                      type="number"
                      id="totalSlots"
                      name="totalSlots"
                      value={formData.totalSlots}
                      onChange={handleInputChange}
                      className="form-input"
                      min="1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="operatingHours.open" className="form-label">Opening Time</label>
                    <input
                      type="time"
                      id="operatingHours.open"
                      name="operatingHours.open"
                      value={formData.operatingHours.open}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="operatingHours.close" className="form-label">Closing Time</label>
                    <input
                      type="time"
                      id="operatingHours.close"
                      name="operatingHours.close"
                      value={formData.operatingHours.close}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Amenities</label>
                  <div className="dropdown" style={{ position: 'relative' }}>
                    <details>
                      <summary className="form-input" style={{ cursor: 'pointer', listStyle: 'none' }}>
                        {formData.amenities.length ? formData.amenities.join(', ') : 'Select amenities'}
                      </summary>
                      <div className="dropdown-menu" style={{ position: 'absolute', zIndex: 10, background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: '0.75rem', width: '100%' }}>
                        {allAmenities.map(a => (
                          <label key={a} className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
                            <input type="checkbox" checked={formData.amenities.includes(a)} onChange={() => toggleAmenity(a)} />
                            <span>{a}</span>
                          </label>
                        ))}
                      </div>
                    </details>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingStation ? 'Update Station' : 'Add Station'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showBlockForm && selectedStation && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Block Slot - {selectedStation.name}</h2>
                <button 
                  className="btn-close"
                  onClick={() => {
                    setShowBlockForm(false);
                    setSelectedStation(null);
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleBlockSubmit} className="block-form">
                <div className="form-group">
                  <label htmlFor="slotNumber" className="form-label">Slot Number</label>
                  <input
                    type="number"
                    id="slotNumber"
                    name="slotNumber"
                    value={blockFormData.slotNumber}
                    onChange={handleBlockInputChange}
                    className="form-input"
                    min="1"
                    max={selectedStation.totalSlots}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="startTime" className="form-label">Start Time</label>
                    <input
                      type="datetime-local"
                      id="startTime"
                      name="startTime"
                      value={blockFormData.startTime}
                      onChange={handleBlockInputChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="endTime" className="form-label">End Time</label>
                    <input
                      type="datetime-local"
                      id="endTime"
                      name="endTime"
                      value={blockFormData.endTime}
                      onChange={handleBlockInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reason" className="form-label">Reason (Optional)</label>
                  <textarea
                    id="reason"
                    name="reason"
                    value={blockFormData.reason}
                    onChange={handleBlockInputChange}
                    className="form-textarea"
                    rows={2}
                    placeholder="e.g., Maintenance, Offline booking"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Block Slot
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowBlockForm(false);
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

        <div className="stations-grid">
          {stations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏪</div>
              <h3>No Stations Yet</h3>
              <p>Add your first charging station to get started</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddForm(true)}
              >
                Add Station
              </button>
            </div>
          ) : (
            stations.map(station => (
              <div key={station._id} className="station-card">
                <div className="station-header">
                  <h3>{station.name}</h3>
                  <div className={`status-badge ${station.isActive ? 'active' : 'inactive'}`}>
                    {station.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="station-info">
                  <p className="station-address">{station.address}</p>
                  <p className="station-description">{station.description}</p>
                </div>

                <div className="station-stats">
                  <div className="stat">
                    <span className="stat-label">Total Slots:</span>
                    <span className="stat-value">{station.totalSlots}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Available:</span>
                    <span className="stat-value">{station.availableSlots}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Rate:</span>
                    <span className="stat-value">₹{station.chargingRate}/hr</span>
                  </div>
                </div>

                <div className="station-hours">
                  <span className="hours-label">Operating Hours:</span>
                  <span className="hours-value">{station.operatingHours.open} - {station.operatingHours.close}</span>
                </div>

                {station.amenities.length > 0 && (
                  <div className="station-amenities">
                    <span className="amenities-label">Amenities:</span>
                    <div className="amenities-list">
                      {station.amenities.map((amenity, index) => (
                        <span key={index} className="amenity-tag">{amenity}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="station-actions">
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => handleEdit(station)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => handleBlockSlot(station)}
                  >
                    Block Slot
                  </button>
                  <Link 
                    to={`/station-owner/bookings?station=${station._id}`}
                    className="btn btn-outline btn-sm"
                  >
                    View Bookings
                  </Link>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(station._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .stations-page {
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

        .stations-actions {
          margin-bottom: 2rem;
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

        .station-form, .block-form {
          padding: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .stations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }

        .empty-state {
          grid-column: 1 / -1;
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
          margin-bottom: 2rem;
        }

        .station-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .station-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .station-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .station-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.active {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.inactive {
          background: #f8d7da;
          color: #721c24;
        }

        .station-info {
          margin-bottom: 1rem;
        }

        .station-address {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .station-description {
          color: #333;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .station-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .stat {
          text-align: center;
        }

        .stat-label {
          display: block;
          font-size: 0.75rem;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          font-size: 1rem;
          font-weight: 600;
          color: #333;
        }

        .station-hours {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding: 0.5rem 0;
          border-top: 1px solid #eee;
        }

        .hours-label {
          font-size: 0.875rem;
          color: #666;
          font-weight: 500;
        }

        .hours-value {
          font-size: 0.875rem;
          color: #333;
          font-weight: 600;
        }

        .station-amenities {
          margin-bottom: 1rem;
        }

        .amenities-label {
          display: block;
          font-size: 0.875rem;
          color: #666;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .amenities-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .amenity-tag {
          background: #e9ecef;
          color: #495057;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
        }

        .station-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .stations-grid {
            grid-template-columns: 1fr;
          }

          .station-stats {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .station-actions {
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

export default StationOwnerMyStations;


// Helper component to capture map clicks and set pin
const MapClickSetter: React.FC<{ onPick: (lat: number, lng: number) => void }> = ({ onPick }) => {
  useMapEvents({
    click: (e) => {
      onPick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};
