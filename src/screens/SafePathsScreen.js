import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import axios from 'axios';

const App = () => {
  const [crimeData, setCrimeData] = useState([]);
  const [safePath, setSafePath] = useState([]);

  useEffect(() => {
    fetchCrimeData();
  }, []);

  const fetchCrimeData = async () => {
    try {
      const response = await axios.get('https://78b9-2409-40e4-4c-63ce-cc6a-4d57-2318-3924.ngrok-free.app/crime-data');
      setCrimeData(response.data);
    } catch (error) {
      console.error('Error fetching crime data:', error);
    }
  };

  const calculateSafePath = () => {
   
    const crimeLimitThreshold = 10; //crime limit threshold
    const unsafeAreas = crimeData.filter(crime => crime.count > crimeLimitThreshold);
    const safeAreas = crimeData.filter(crime => crime.count <= crimeLimitThreshold);

    const startCoordinate = { latitude: safeAreas[0].latitude, longitude: safeAreas[0].longitude };
    const endCoordinate = { latitude: safeAreas[safeAreas.length - 1].latitude, longitude: safeAreas[safeAreas.length - 1].longitude };
    const pathCoordinates = [startCoordinate, endCoordinate];
    setSafePath(pathCoordinates);
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }}>
        {/* Render markers for crime data */}
        {crimeData.map((crime, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: crime.latitude, longitude: crime.longitude }}
            title={crime.title}
          />
        ))}
        {safePath.length > 0 && (
          <Polyline
            coordinates={safePath}
            strokeColor="#00FF00" // Green color for safe path
            strokeWidth={5}
          />
        )}
      </MapView>

      <View style={{ position: 'absolute', bottom: 0, alignSelf: 'center' }}>
        <Button title="Calculate Safe Path" onPress={calculateSafePath} />
      </View>
    </View>
  );
};

export default App;
