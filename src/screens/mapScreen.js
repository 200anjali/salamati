import React, { useState, useEffect } from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const App = () => {
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    requestLocationPermission();
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
        setCurrentLocation({ latitude, longitude });
      },
      error => {
        console.error('Error getting current location:', error.message);
        Alert.alert('Error', 'Could not get current location.');
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
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
          <Marker coordinate={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }} />
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
