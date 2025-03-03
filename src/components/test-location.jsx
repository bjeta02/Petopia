import React, { useState, useEffect } from 'react';

function TestLocationAccess() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setError(null);
        },
        (err) => {
          setError(err.message);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', textAlign: 'center' }}>
      <h1>📍 Test Location Access</h1>
      {location ? (
        <div>
          <h2>✅ Location Access Granted</h2>
          <p>Latitude: {location.latitude}</p>
          <p>Longitude: {location.longitude}</p>
          <a
            href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Google Maps
          </a>
        </div>
      ) : error ? (
        <div>
          <h2>❌ Location Access Denied</h2>
          <p>{error}</p>
          <p>Please enable location services and allow location access in your browser settings.</p>
        </div>
      ) : (
        <h2>Loading location...</h2>
      )}
    </div>
  );
}

export default TestLocationAccess;
