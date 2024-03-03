import React, {useState, useEffect} from 'react';
import {View, Button, Alert, StyleSheet} from 'react-native';
import MapView, {
  Marker,
  Polygon,
  Polyline,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {Directions} from 'react-native-maps-directions';
import crimeData from '../crimeometer/crimeometer.json';
import safePlaces from '../crimeometer/safePlaces.json';
import axios from 'axios';

const App = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [crimeProneAreas, setCrimeProneAreas] = useState([]);
  const [nearbySafePlaces, setNearbySafePlaces] = useState([]);
  const [destination, setDestination] = useState({
    latitude: 39.734,
    longitude: -104.981,
  });
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  useEffect(() => {
    requestLocationPermission();
    extractCrimeProneAreas();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const permissionResult = await check(
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      );
      if (permissionResult === RESULTS.GRANTED) {
        getCurrentLocation();
      } else {
        const newPermissionResult = await request(
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        );
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
        const {latitude, longitude} = position.coords;
        // setCurrentLocation({ latitude, longitude });
        // fetchNearbySafePlaces({ latitude, longitude });
        setCurrentLocation({latitude: 39.735, longitude: -104.98});
        findNearestSafePlace({latitude: 39.735, longitude: -104.98});
      },
      error => {
        console.error('Error getting current location:', error.message);
        Alert.alert('Error', 'Could not get current location.');
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );
  };

  const extractCrimeProneAreas = () => {
    const crimeAreas = crimeData
      .filter(item => item.severity > 1)
      .map(item => ({
        latitude: item.lat,
        longitude: item.lng,
      }));
    setCrimeProneAreas(crimeAreas);
  };

  //   const fetchNearbySafePlaces = async (latitude, longitude) => {
  //     try {
  //       const response = await axios.get(
  //         `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=10000&key=AIzaSyCJ646sNct8O7v0BwnBE6MgfNeiR15_Y6Y`
  //       );
  //       if (response.data.results) {
  //         const safePlaces = response.data.results.map(place => ({
  //           latitude: place.geometry.location.lat,
  //           longitude: place.geometry.location.lng,
  //           name: place.name,
  //         }));
  //         setNearbySafePlaces(safePlaces);
  //         console.log(nearbySafePlaces);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching nearby safe places:', error.message);
  //       Alert.alert('Error', 'Could not fetch nearby safe places.');
  //     }
  //   };

  const getDirections = async () => {
    const directions = await Directions.getDirections({
      currentLocation,
      destination,
    });
    console.log(currentLocation);
    console.log(destination);
    console.log(directions);
  };

  const findNearestSafePlace = (latitude, longitude) => {
    let nearestPlace = {latitude: 39.734, longitude: -104.981};
    let minDistance = Number.MAX_VALUE;

    safePlaces.forEach(place => {
      const distance = calculateDistance(
        latitude,
        longitude,
        place.latitude,
        place.longitude,
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestPlace = place;
      }
    });

    setDestination(nearestPlace);
    console.log(nearestPlace);
    if (nearestPlace) {
      const origin = `${latitude},${longitude}`;
      const destination = `${nearestPlace.latitude},${nearestPlace.longitude}`;
      const waypoints = [];
      const mode = 'driving';

      fetchDirections(origin, destination, waypoints, mode);
    }
  };
  const fetchDirections = (origin, destination, waypoints, mode) => {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=AIzaSyDurRU66cZn6sP-shOz6VdMJB6hExXQVxc`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'OK') {
          const polyline = data.routes[0].overview_polyline.points;
          const decodedPolyline = decodePolyline(polyline);
          setRouteCoordinates(decodedPolyline);
        } else {
          console.error('Error fetching directions:', data.status);
          Alert.alert('Error', 'Could not fetch directions.');
        }
      })
      .catch(error => {
        console.error('Error fetching directions:', error);
        Alert.alert('Error', 'Could not fetch directions.');
      });
  };

  const decodePolyline = polyline => {
    const points = [];
    let index = 0,
      lat = 0,
      lng = 0;

    while (index < polyline.length) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = polyline.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = polyline.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;
      points.push({latitude: lat / 1e5, longitude: lng / 1e5});
    }
    return points;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * (Math.PI / 180);
    const φ2 = lat2 * (Math.PI / 180);
    const Δφ = (lat2 - lat1) * (Math.PI / 180);
    const Δλ = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  return (
    <View style={styles.container}>
      <Button title="Show My Location" onPress={requestLocationPermission} />
      {currentLocation && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}>
          {crimeProneAreas.map((crimeArea, index) => (
            <Polygon
              key={index}
              coordinates={[
                {
                  latitude: crimeArea.latitude + 0.001,
                  longitude: crimeArea.longitude + 0.001,
                },
                {
                  latitude: crimeArea.latitude - 0.001,
                  longitude: crimeArea.longitude + 0.001,
                },
                {
                  latitude: crimeArea.latitude - 0.001,
                  longitude: crimeArea.longitude - 0.001,
                },
                {
                  latitude: crimeArea.latitude + 0.001,
                  longitude: crimeArea.longitude - 0.001,
                },
              ]}
              fillColor="rgba(255, 0, 0, 0.5)"
              strokeWidth={2}
              strokeColor="red"
            />
          ))}
          {nearbySafePlaces.map((place, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
              title={place.name}
              pinColor="blue" // Mark safe places as green
            />
          ))}
          {safePlaces.map((place, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
              title={place.name}
              description={place.type}
              pinColor="green" // Set marker color to green
            />
          ))}
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="You are here"
          />
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            title={destination.name}
            pinColor="green"
          />
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={4}
            strokeColor="#FF0000"
          />
        </MapView>
      )}
      <Button title="Get Directions" onPress={getDirections} />
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
