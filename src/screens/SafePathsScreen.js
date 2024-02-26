import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import axios from 'axios';

    const SafePathsScreen = () => {
    const [crimeData, setCrimeData] = useState([]);
    const [safePaths, setSafePaths] = useState([]);

    useEffect(() => {
     // Fetch crime data from your Flask backend using Axios
    axios.get('http://your-flask-api-endpoint/crime-data')
        .then(response => setCrimeData(response.data))
        .catch(error => console.error('Error fetching crime data:', error));
    }, []);

  // Process crimeData to generate safePaths
  // ...

    return (
    <View style={{ flex: 1 }}>
        <MapView
        style={{ flex: 1 }}
        provider="mapbox"
        mapType="standard"
        region={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        }}
    >
        {/* Display markers for crime incidents */}
        {crimeData.map(crime => (
            <Marker
            key={crime.id}
            coordinate={{ latitude: crime.latitude, longitude: crime.longitude }}
            title={crime.title}
            />
        ))}

        {/* Display Polyline for safe paths */}
        <Polyline
            coordinates={safePaths}
            strokeWidth={2}
            strokeColor="green"
        />
        </MapView>
    </View>
    );
};

export default SafePathsScreen;
