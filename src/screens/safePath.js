import React, { useState, useEffect } from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import MapboxGL from "@react-native-mapbox-gl/maps";
import Geolocation from '@react-native-community/geolocation';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import crimeData from '../crimeometer/crimeometer.json';
import safePlaces from '../crimeometer/safePlaces.json';
import axios from 'axios';

MapboxGL.setAccessToken(
    "pk.eyJ1IjoiaGFyc2hhLTEyMzQiLCJhIjoiY2w1NHo1ejV0MTJ6bjNkdDdrZnd1bTQ2aSJ9.EorqqpBo_rOqkbukv_oixQ"
  );

const App = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [crimeProneAreas, setCrimeProneAreas] = useState([]);
  const [nearbySafePlaces, setNearbySafePlaces] = useState([]);
  const [destination, setDestination] = useState({ latitude: 39.734, longitude: -104.981 });
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  useEffect(() => {
    requestLocationPermission();
    extractCrimeProneAreas();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const permissionResult = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      if (permissionResult === RESULTS.GRANTED) {
        getCurrentLocation();
      } else {
        const newPermissionResult = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        if (newPermissionResult === RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          Alert.alert('Location permission denied');
        }
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        // setCurrentLocation({ latitude, longitude });
        // findNearestSafePlace(latitude, longitude);

        setCurrentLocation({ latitude: 39.735, longitude: -104.98 });
        findNearestSafePlace({ latitude: 39.735, longitude: -104.98 });
      },
      error => {
        console.error('Error getting current location:', error.message);
        Alert.alert('Error', 'Could not get current location.');
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  const extractCrimeProneAreas = () => {
    const crimeAreas = crimeData.filter(item => item.severity > 1).map(item => ({
      latitude: item.lat,
      longitude: item.lng,
    }));
    setCrimeProneAreas(crimeAreas);
  };

  const findNearestSafePlace = (latitude, longitude) => {
    let nearestPlace = { latitude: 39.734, longitude: -104.981 };
    let minDistance = Number.MAX_VALUE;

    safePlaces.forEach(place => {
      const distance = calculateDistance(latitude, longitude, place.latitude, place.longitude);
      if (distance < minDistance) {
        minDistance = distance;
        nearestPlace = place;
      }
    });

    setDestination(nearestPlace);

    if (nearestPlace) {
      const origin = [longitude, latitude];
      const destination = [nearestPlace.longitude, nearestPlace.latitude];
      const waypoints = [];
      const mode = 'driving';

      fetchDirections(origin, destination, waypoints, mode);
    }
  };

  const fetchDirections = (origin, destination, waypoints, mode) => {
    const requestOptions = {
      waypoints: waypoints.map(waypoint => ({
        coordinates: [waypoint.longitude, waypoint.latitude],
      })),
      alternatives: false,
      geometries: 'geojson',
      steps: true,
      overview: 'full',
      annotations: 'distance',
      profile: 'driving',
      language: 'en',
      accessToken: MapboxGL.getAccessToken(),
    };

    MapboxGL.getDirections(origin, destination, requestOptions)
      .then(response => {
        if (response.routes && response.routes.length > 0) {
          const route = response.routes[0];
          const routeCoordinates = route.geometry.coordinates.map(coord => ({
            latitude: coord[1],
            longitude: coord[0],
          }));
          setRouteCoordinates(routeCoordinates);
        } else {
          console.error('No routes found');
          Alert.alert('Error', 'Could not fetch directions.');
        }
      })
      .catch(error => {
        console.error('Error fetching directions:', error);
        Alert.alert('Error', 'Could not fetch directions.');
      });
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Implement the distance calculation logic here
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * (Math.PI / 180);
    const φ2 = lat2 * (Math.PI / 180);
    const Δφ = (lat2 - lat1) * (Math.PI / 180);
    const Δλ = (lon2 - lon1) * (Math.PI / 180);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  return (
    <View style={styles.container}>
      <Button title="Show My Location" onPress={requestLocationPermission} />
      {currentLocation && (
        <MapboxGL.MapView style={styles.map} styleURL={MapboxGL.StyleURL.Outdoors}>
          {/* Render crime prone areas */}
          {crimeProneAreas.map((crimeArea, index) => (
            <MapboxGL.ShapeSource key={index} id={`crimeArea-${index}`} shape={{ type: 'Point', coordinates: [crimeArea.longitude, crimeArea.latitude] }}>
              <MapboxGL.CircleLayer
                id={`crimeAreaCircle-${index}`}
                style={{ circleRadius: 10, circleColor: 'red' }}
              />
            </MapboxGL.ShapeSource>
          ))}
          {/* Render nearby safe places */}
          {nearbySafePlaces.map((place, index) => (
            <MapboxGL.PointAnnotation key={index} id={`safePlace-${index}`} coordinate={[place.longitude, place.latitude]}>
              <MapboxGL.Callout title={place.name} />
            </MapboxGL.PointAnnotation>
          ))}
          {/* Render current location marker */}
          <MapboxGL.PointAnnotation id="currentLocation" coordinate={[currentLocation.longitude, currentLocation.latitude]}>
            <MapboxGL.Callout title="You are here" />
          </MapboxGL.PointAnnotation>
          {/* Render destination marker */}
          <MapboxGL.PointAnnotation id="destination" coordinate={[destination.longitude, destination.latitude]}>
            <MapboxGL.Callout title={destination.name} />
          </MapboxGL.PointAnnotation>
          {/* Render route polyline */}
          <MapboxGL.ShapeSource id="routeSource" shape={{ type: 'LineString', coordinates: routeCoordinates }}>
            <MapboxGL.LineLayer id="routeLayer" style={{ lineColor: '#FF0000', lineWidth: 3 }} />
          </MapboxGL.ShapeSource>
        </MapboxGL.MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default App;
