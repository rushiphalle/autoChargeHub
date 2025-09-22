import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline, useMap } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import type { Map as LeafletMap } from 'leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const createColorIcon = (color: string) => divIcon({
  html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 2px rgba(0,0,0,0.5);"></div>`,
  className: 'color-dot-marker',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

const stationIcon = createColorIcon('#28a745');
const currentIcon = createColorIcon('#007bff');
const pinnedIcon = createColorIcon('#dc3545');

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

interface UserLocation {
  lat: number;
  lng: number;
}

const NearbyStations: React.FC = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [customLocation, setCustomLocation] = useState<UserLocation | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090]); // Default to Delhi
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number; durationMin: number } | null>(null);
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);

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

  // Fetch stations around the selected center within radius

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const location = customLocation || userLocation;
        if (!location) return;

        const response = await axios.get(process.env.SERVER_DOMAIN + '/api/stations', {
          params: {
            lat: location.lat,
            lng: location.lng,
            radius: radiusKm
          }
        });
        setStations(response.data);
      } catch (err: any) {
        setError('Failed to load charging stations');
        console.error('Fetch stations error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userLocation || customLocation) {
      run();
    }
  }, [userLocation, customLocation, radiusKm]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter([location.lat, location.lng]);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please search for a location manually.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  };

  

  // Removed manual address search. Users can set a pin by tapping the map and choose radius below.

  const centerLocation = customLocation || userLocation;

  // Helper component to expose Leaflet map instance
  const SetMapRef: React.FC<{ onReady: (map: LeafletMap) => void }> = ({ onReady }) => {
    const map = useMap();
    useEffect(() => {
      onReady(map);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map]);
    return null;
  };

  // Haversine distance in km
  const distanceKm = (from: UserLocation | null, to: { lat: number; lng: number }) => {
    if (!from) return null;
    const R = 6371; // km
    const dLat = (to.lat - from.lat) * Math.PI / 180;
    const dLon = (to.lng - from.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Fetch route via OSRM and draw polyline
  const showRouteToStation = async (station: ChargingStation) => {
    try {
      if (!centerLocation) return;
      const from = `${centerLocation.lng},${centerLocation.lat}`;
      const to = `${station.location.coordinates[0]},${station.location.coordinates[1]}`;
      const url = `https://router.project-osrm.org/route/v1/driving/${from};${to}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.code !== 'Ok' || !data.routes?.length) {
        setError('Failed to compute route');
        return;
      }
      const route = data.routes[0];
      const coords: [number, number][] = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
      setRouteCoords(coords);
      setRouteInfo({
        distanceKm: +(route.distance / 1000).toFixed(2),
        durationMin: +((route.duration / 60)).toFixed(0)
      });
      // Fit bounds
      if (mapInstance && coords.length) {
        const bounds = L.latLngBounds(coords.map((p: [number, number]) => L.latLng(p[0], p[1])));
        mapInstance.fitBounds(bounds, { padding: [50, 50] });
      }
    } catch (e) {
      setError('Failed to fetch route');
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

  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setCustomLocation({ lat, lng });
        setMapCenter([lat, lng]);
      }
    });
    return null;
  };

  if (loading) {
    return (
      <div className="nearby-stations-page">
        <div className="container">
          <div className="loading">Loading nearby stations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="nearby-stations-page">
      <div className="container">
        <div className="page-header">
          <h1>Find Nearby Charging Stations</h1>
          <p>Discover charging stations around your current or pinned location by selecting a distance range</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="search-section">
          <div className="radius-controls">
            <label htmlFor="radius" className="radius-label">Search within</label>
            <select
              id="radius"
              className="radius-select"
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseInt(e.target.value))}
            >
              <option value={2}>2 km</option>
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={20}>20 km</option>
              <option value={50}>50 km</option>
            </select>
            <span className="location-hint">Tap on map to change the search center</span>
          </div>

          <div className="location-info">
            {userLocation && !customLocation && (
              <p className="location-text">
                📍 Using your current location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </p>
            )}
            {customLocation && (
              <p className="location-text">
                📍 Using pinned location: {customLocation.lat.toFixed(4)}, {customLocation.lng.toFixed(4)}
              </p>
            )}
          </div>
        </div>

        <div className="map-section">
          <div className="map-container">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '500px', width: '100%' }}
            >
              <SetMapRef onReady={(m) => setMapInstance(m)} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapEvents />
              {routeCoords.length > 0 && (
                <Polyline positions={routeCoords} pathOptions={{ color: '#007bff', weight: 5, opacity: 0.8 }} />
              )}
              
              {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]} icon={currentIcon}>
                  <Popup>
                    <strong>Your Location</strong>
                  </Popup>
                </Marker>
              )}
              {customLocation && (
                <Marker position={[customLocation.lat, customLocation.lng]} icon={pinnedIcon}>
                  <Popup>
                    <strong>Pinned Location</strong>
                  </Popup>
                </Marker>
              )}
              
              {stations.map(station => (
                <Marker 
                  key={station._id} 
                  position={[station.location.coordinates[1], station.location.coordinates[0]]}
                  icon={stationIcon}
                >
                  <Popup>
                    <div className="station-popup">
                      <h3>{station.name}</h3>
                      <p>{station.address}</p>
                      <p>Rate: ₹{station.chargingRate}/hour</p>
                      <p>Available Slots: {station.availableSlots}/{station.totalSlots}</p>
                      {centerLocation && (
                        <p><strong>{distanceKm(centerLocation, { lat: station.location.coordinates[1], lng: station.location.coordinates[0] })?.toFixed(2)} km away</strong></p>
                      )}
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleStationSelect(station)}
                      >
                        Book Now
                      </button>
                      <button 
                        className="btn btn-outline btn-sm"
                        style={{ marginLeft: '0.5rem' }}
                        onClick={() => showRouteToStation(station)}
                      >
                        Show Route
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="stations-list">
            <h3>Nearby Stations ({stations.length})</h3>
            {stations.length === 0 ? (
              <div className="empty-state">
                <p>No charging stations found in this area</p>
                <button 
                  className="btn btn-outline"
                  onClick={() => setCustomLocation(null)}
                >
                  Try Different Location
                </button>
              </div>
            ) : (
              <div className="stations-grid">
                {stations.map(station => (
                  <div key={station._id} className="station-card">
                    <div className="station-header">
                      <h4>{station.name}</h4>
                      <div className="station-badges">
                        <span className="rate-badge">₹{station.chargingRate}/hr</span>
                        <span className="slots-badge">
                          {station.availableSlots}/{station.totalSlots} slots
                        </span>
                        {centerLocation && (
                          <span className="distance-badge">{distanceKm(centerLocation, { lat: station.location.coordinates[1], lng: station.location.coordinates[0] })?.toFixed(2)} km away</span>
                        )}
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

                    <div className="station-actions">
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleStationSelect(station)}
                      >
                        Book This Station
                      </button>
                      <button 
                        className="btn btn-outline"
                        onClick={() => showRouteToStation(station)}
                      >
                        Show Route
                      </button>
                    </div>
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

      {routeInfo && (
        <div className="route-info" style={{ marginTop: '0.5rem' }}>
          Route: ~{routeInfo.distanceKm} km, ~{routeInfo.durationMin} min
        </div>
      )}

      <style>{`
        .nearby-stations-page {
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

        .search-section {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .search-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .search-input {
          flex: 1;
          padding: 0.75rem;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
        }

        .search-input:focus {
          outline: none;
          border-color: #007bff;
        }

        .location-info {
          text-align: center;
        }

        .location-text {
          color: #666;
          font-size: 0.9rem;
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
          max-height: 500px;
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

        .distance-badge {
          background: #e9ecef;
          color: #495057;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-weight: 600;
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

        .slots-badge {
          background: #d1ecf1;
          color: #0c5460;
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

        .station-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
          flex-wrap: wrap;
        }

        .route-info {
          margin-top: 0.5rem;
          font-size: 0.8rem;
          color: #333;
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

          .search-bar {
            flex-direction: column;
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

export default NearbyStations;

