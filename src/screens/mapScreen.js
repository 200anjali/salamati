import React, { useState, useEffect } from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import MapView, { Marker,  Polygon } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import crimeData from '../crimeometer/crimeometer.json';

const App = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [crimeProneAreas, setCrimeProneAreas] = useState([]);
  const [nearbySafePlaces, setNearbySafePlaces] = useState([]);

  useEffect(() => {
    requestLocationPermission();
    extractCrimeProneAreas();
    fetchNearbySafePlaces();
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
        setCurrentLocation({ latitude: 39.735, longitude: -104.98 });
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

  const fetchNearbySafePlaces = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=hospital,police&key=AIzaSyAKeN0XMV5LqJmqBrZZ1K8qMipFW7-Eybg`
      );
      if (response.data.results) {
        const safePlaces = response.data.results.map(place => ({
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          name: place.name,
        }));
        setNearbySafePlaces(safePlaces);
      }
    } catch (error) {
      console.error('Error fetching nearby safe places:', error.message);
      Alert.alert('Error', 'Could not fetch nearby safe places.');
    }
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
          }}
        >
          {crimeProneAreas.map((crimeArea, index) => (
            <Polygon
              key={index}
              coordinates={[
                { latitude: crimeArea.latitude + 0.001, longitude: crimeArea.longitude + 0.001 },
                { latitude: crimeArea.latitude - 0.001, longitude: crimeArea.longitude + 0.001 },
                { latitude: crimeArea.latitude - 0.001, longitude: crimeArea.longitude - 0.001 },
                { latitude: crimeArea.latitude + 0.001, longitude: crimeArea.longitude - 0.001 },
              ]}
              fillColor="rgba(255, 0, 0, 0.5)"
              strokeWidth={2}
              strokeColor="red"
            />
          ))}
           {nearbySafePlaces.map((place, index) => (
            <Marker
              key={index}
              coordinate={{ latitude: place.latitude, longitude: place.longitude }}
              title={place.name}
              pinColor="green" // Mark safe places as green
            />
          ))}
          <Marker
            coordinate={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }}
            title="You are here"
          />
        </MapView>
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
