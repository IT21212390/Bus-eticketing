import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1Ijoib3NoaWkiLCJhIjoiY20yZDQ5dWl2MWI4ODJqczd6dDBldmQ5NSJ9.N_NQAeZYdHSAzH30vllqSQ';

// Define route coordinates with waypoints for each bus route
const ROUTE_COORDINATES = {
  'Colombo - Kandy': {
    start: [79.8612, 6.9271], // Colombo
    waypoints: [
      [80.0199, 7.0831], // Kadugannawa
      [80.3573, 7.1643], // Peradeniya
    ],
    end: [80.6333, 7.2906], // Kandy
    center: [80.2472, 7.1088],
    zoom: 9,
    color: '#0066cc'
  },
  'Galle - Jaffna': {
    start: [80.2167, 6.0333], // Galle
    waypoints: [
      [79.8612, 6.9271], // Colombo
      [80.0199, 7.0831], // Kurunegala
      [80.4974, 8.7514], // Vavuniya
    ],
    end: [80.0074, 9.6615], // Jaffna
    center: [80.1120, 7.8474],
    zoom: 6,
    color: '#cc6600'
  },
  'Katharagama - Jaffna': {
    start: [81.3352, 6.4146], // Katharagama
    waypoints: [
      [81.0549, 6.9019], // Buttala
      [81.0667, 7.2833], // Mahiyangana
      [80.5742, 7.4836], // Matale
      [80.4974, 8.7514], // Vavuniya
    ],
    end: [80.0074, 9.6615], // Jaffna
    center: [80.6713, 7.9380],
    zoom: 6,
    color: '#006633'
  },
  'Colombo - Vauniya': {
    start: [79.8612, 6.9271], // Colombo
    waypoints: [
      [80.0199, 7.0831], // Kurunegala
      [80.3573, 7.1643], // Dambulla
    ],
    end: [80.4974, 8.7514], // Vauniya
    center: [80.1793, 7.8392],
    zoom: 7,
    color: '#990066'
  },
  'Colombo - Trincomalee': {
    start: [79.8612, 6.9271], // Colombo
    waypoints: [
      [80.0199, 7.0831], // Kurunegala
      [80.3573, 7.1643], // Dambulla
      [80.6333, 7.2906], // Habarana
    ],
    end: [81.2335, 8.5874], // Trincomalee
    center: [80.5473, 7.7572],
    zoom: 7,
    color: '#666600'
  }
};

const BusTracker = ({ selectedRoute }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [80.7718, 7.8731], // Sri Lanka center
      zoom: 7
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  async function getRouteGeometry(coordinates) {
    const waypoints = coordinates.join(';');
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${waypoints}?geometries=geojson&access_token=${mapboxgl.accessToken}`
    );
    const data = await response.json();
    return data.routes[0].geometry;
  }

  // Update map when route is selected
  useEffect(() => {
    if (!map.current || !selectedRoute) return;

    const updateRoute = async () => {
      // Clear existing markers
      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      // Clear existing layers and sources
      if (map.current.getLayer('route')) {
        map.current.removeLayer('route');
      }
      if (map.current.getSource('route')) {
        map.current.removeSource('route');
      }

      const routeInfo = ROUTE_COORDINATES[selectedRoute];
      if (!routeInfo) return;

      // Create array of all coordinates including waypoints
      const allPoints = [
        routeInfo.start,
        ...(routeInfo.waypoints || []),
        routeInfo.end
      ];

      try {
        // Get the actual route geometry from Mapbox Directions API
        const geometry = await getRouteGeometry(allPoints);

        // Add route source and layer
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: geometry
          }
        });

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': routeInfo.color || '#0066cc',
            'line-width': 4
          }
        });

        // Add markers for start, waypoints, and end
        // Start marker (green)
        const startMarker = new mapboxgl.Marker({ color: '#00ff00' })
          .setLngLat(routeInfo.start)
          .setPopup(new mapboxgl.Popup().setHTML(`<h3>Start: ${selectedRoute.split(' - ')[0]}</h3>`))
          .addTo(map.current);
        markers.current.push(startMarker);

        // Waypoint markers (blue)
        if (routeInfo.waypoints) {
          routeInfo.waypoints.forEach((waypoint, index) => {
            const waypointMarker = new mapboxgl.Marker({ color: '#0066cc' })
              .setLngLat(waypoint)
              .setPopup(new mapboxgl.Popup().setHTML(`<h3>Stop ${index + 1}</h3>`))
              .addTo(map.current);
            markers.current.push(waypointMarker);
          });
        }

        // End marker (red)
        const endMarker = new mapboxgl.Marker({ color: '#ff0000' })
          .setLngLat(routeInfo.end)
          .setPopup(new mapboxgl.Popup().setHTML(`<h3>End: ${selectedRoute.split(' - ')[1]}</h3>`))
          .addTo(map.current);
        markers.current.push(endMarker);

        // Fit map to show the entire route
        map.current.flyTo({
          center: routeInfo.center,
          zoom: routeInfo.zoom,
          essential: true
        });

      } catch (error) {
        console.error('Error fetching route:', error);
        // Fallback to direct line if the route fetch fails
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: allPoints
            }
          }
        });

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': routeInfo.color || '#0066cc',
            'line-width': 4
          }
        });
      }
    };

    map.current.on('style.load', () => {
      updateRoute();
    });

    if (map.current.isStyleLoaded()) {
      updateRoute();
    }

  }, [selectedRoute]);

  return (
    <div className="h-96 bg-gray-200">
      <div ref={mapContainer} className="h-full" />
    </div>
  );
};

export default BusTracker;