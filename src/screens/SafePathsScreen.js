import React, { useEffect, useState } from 'react';
import { View, Text ,Button} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';

const App = () => {
    const [crimeData, setCrimeData] = useState([]);
    const [safePath, setSafePath] = useState([]);

    useEffect(() => {
    fetchCrimeData();
    }, []);

    const fetchCrimeData = async () => {
    try {
        const response = await axios.get('http://127.0.0.1:5000/crime-data');
        setCrimeData(response.data);
    } catch (error) {
        console.error('Error fetching crime data:', error);
    }
    };

  // Function to calculate safe path based on crime data
    const calculateSafePath = () => {
    // Implement your logic here to calculate the safe path
    // This could involve processing the crime data and finding the route to the nearest safe place
    // Once you have the safe path, update the state
    setSafePath(/* calculated safe path */);
    };

    return (
    <View style={{ flex: 1 }}>
        <MapView style={{ flex: 1 }}>
        {crimeData.map((crime, index) => (
            <Marker
            key={index}
            coordinate={{ latitude: crime.latitude, longitude: crime.longitude }}
            title={crime.title}
            />
        ))}

        {safePath.map((point, index) => (
            <Marker
            key={index}
            coordinate={{ latitude: point.latitude, longitude: point.longitude }}
            pinColor="green" // Customize pin color for safe path
            />
        ))}
        </MapView>

        <View style={{ position: 'absolute', bottom: 0, alignSelf: 'center' }}>
        <Button title="Calculate Safe Path" onPress={calculateSafePath} />
        </View>
    </View>
    );
};

export default App;