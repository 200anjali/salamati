import React, {useState, useRef, useEffect} from 'react';
import MapView, {Marker, Polygon, Polyline} from 'react-native-maps';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {
  GooglePlaceDetail,
  GooglePlacesAutocomplete,
} from 'react-native-google-places-autocomplete';
import MapViewDirections from 'react-native-maps-directions';
import Geolocation from '@react-native-community/geolocation';
import crimeData from '../crimeometer/crimeometer.json';
import safePlaces from '../crimeometer/safePlaces.json';

const {width, height} = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const INITIAL_POSITION = {
  latitude: 40.76711,
  longitude: -73.979704,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

function InputAutocomplete({label, placeholder, onPlaceSelected}) {
  return (
    <>
      <Text>{label}</Text>
      <GooglePlacesAutocomplete
        styles={{textInput: styles.input}}
        placeholder={placeholder || ''}
        fetchDetails
        onPress={(data, details = null) => {
          onPlaceSelected(details);
        }}
        query={{
          key: 'GOOGLE_MAP_API',
          language: 'pt-BR',
        }}
      />
    </>
  );
}

export default function App() {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [showDirections, setShowDirections] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [safePlaces, setSafePlaces] = useState([]);
  const [crimeProneAreas, setCrimeProneAreas] = useState([]);

  const mapRef = useRef(null);

  // useEffect(() => {
  //   if (origin) {
  //     fetchSafePlaces(origin.latitude, origin.longitude);
  //   }
  // }, [origin]);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'App needs access to your location.',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission granted');
          getCurrentLocation();
        } else {
          console.log('Location permission denied');
        }
      } else if (Platform.OS === 'ios') {
        Geolocation.requestAuthorization();
        getCurrentLocation();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        const currentLocation = {latitude, longitude};
        setOrigin(currentLocation);
        moveTo(currentLocation);
      },
      error => {
        console.error(error);
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );
  };

  useEffect(() => {
    requestLocationPermission();
    extractCrimeProneAreas();
  }, []);

  const extractCrimeProneAreas = () => {
    const crimeAreas = crimeData
      .filter(item => item.severity > 1)
      .map(item => ({
        latitude: item.lat,
        longitude: item.lng,
      }));
    setCrimeProneAreas(crimeAreas);
  };

  const fetchSafePlaces = async (latitude, longitude) => {
    const radius = 5000; // Search radius in meters
    const types = 'hospital|police|park|shopping_mall|transit_station'; // Desired place types
    const apiKey = 'GOOGLE_MAP_API';
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&types=${types}&key=${apiKey}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'OK') {
          setSafePlaces(data.results);
          const nearestSafePlace = findNearestSafePlace(
            latitude,
            longitude,
            data.results,
          );
          setDestination({
            latitude: nearestSafePlace.geometry.location.lat,
            longitude: nearestSafePlace.geometry.location.lng,
          });
          console.log(latitude, longitude, nearestSafePlace);
        } else {
          console.error('Failed to fetch safe places:', data.status);
        }
      })
      .catch(error => {
        console.error('Error fetching safe places:', error);
      });
  };

  const findNearestSafePlace = (latitude, longitude, places) => {
    let minDistance = Number.MAX_VALUE;
    let nearestPlace = null;
    console.log(places.length);
    console.log(places);

    places.forEach(place => {
      const distance = calculateDistance(
        latitude,
        longitude,
        place.geometry.location.lat,
        place.geometry.location.lng,
      );
      console.log(`Distance to ${place.name}: ${distance}`);
      if (distance < minDistance) {
        minDistance = distance;
        nearestPlace = place;
      }
    });
    console.log(nearestPlace);

    return nearestPlace;
  };

  // Haversine formula used to calculate distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    console.log(lat1, lat2, lon1, lon2);
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = deg => {
    return deg * (Math.PI / 180);
  };

  const moveTo = async position => {
    const camera = await mapRef.current?.getCamera();
    if (camera) {
      camera.center = position;
      mapRef.current?.animateCamera(camera, {duration: 1000});
    }
  };

  const edgePaddingValue = 70;

  const edgePadding = {
    top: edgePaddingValue,
    right: edgePaddingValue,
    bottom: edgePaddingValue,
    left: edgePaddingValue,
  };

  const traceRouteOnReady = args => {
    if (args) {
      setDistance(args.distance);
      setDuration(args.duration);
    }
  };

  const traceRoute = () => {
    console.log(origin, destination);
    if (origin && destination) {
      setShowDirections(true);
      mapRef.current?.fitToCoordinates([origin, destination], {edgePadding});
    }
  };

  const traceRoute1 = () => {
    if (origin && destination) {
      setShowDirections(true);
      const originCoordinates = getCoordinates(origin);
      const destinationCoordinates = getCoordinates(destination);
      const coordinates = [originCoordinates, destinationCoordinates];
      console.log(coordinates);
      mapRef.current?.fitToCoordinates(coordinates, {edgePadding});
    }
  };

  const getCoordinates = location => {
    if (location.latitude && location.longitude) {
      // If location is in the format { latitude, longitude }
      return location;
    } else if (location.geometry && location.geometry.location) {
      // If location is in the format returned by Google Places API
      const {lat, lng} = location.geometry.location;
      return {latitude: lat, longitude: lng};
    } else {
      console.error('Invalid location format:', location);
      return null;
    }
  };
  const showSafePlaces = async () => {
    try {
      if (origin) {
        console.log('Fetching safe places...');
        await fetchSafePlaces(origin.latitude, origin.longitude);
        console.log('Safe places fetched:', safePlaces);
        traceRoute1();
      } else {
        console.error('Origin is null.');
      }
    } catch (error) {
      console.error('Error in showSafePlaces:', error);
    }
  };

  const onPlaceSelected = (details, flag) => {
    if (details && details.geometry && details.geometry.location) {
      const set = flag === 'origin' ? setOrigin : setDestination;
      const position = {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      };
      set(position);
      moveTo(position);
    } else {
      console.error('Invalid place details:', details);
    }
  };

  return (
    <View style={styles.container}>
      <MapView ref={mapRef} style={styles.map} initialRegion={INITIAL_POSITION}>
        {origin && <Marker coordinate={origin} />}
        {destination && <Marker coordinate={destination} pinColor="green" />}
        {showDirections && origin && destination && (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey="GOOGLE_MAP_API"
            strokeColor="#6644ff"
            strokeWidth={4}
            onReady={traceRouteOnReady}
          />
        )}
        {origin && destination && (
          <MapViewDirections
            origin={{latitude: origin.latitude, longitude: origin.longitude}}
            destination={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            apikey="GOOGLE_MAP_API"
            strokeWidth={5}
            strokeColor="hotpink"
          />
        )}
        {safePlaces.map(place => (
          <Marker
            key={place.place_id}
            coordinate={{
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
            }}
            title={place.name}
            pinColor="green"
          />
        ))}
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
      </MapView>
      <View style={styles.searchContainer}>
        <InputAutocomplete
          label="Origin"
          onPlaceSelected={details => {
            onPlaceSelected(details, 'origin');
          }}
        />
        <InputAutocomplete
          label="Destination"
          onPlaceSelected={details => {
            onPlaceSelected(details, 'destination');
          }}
        />
        <TouchableOpacity style={styles.button} onPress={traceRoute}>
          <Text style={styles.buttonText}>Trace route</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={showSafePlaces}>
          <Text style={styles.buttonText}>Show Safe Places</Text>
        </TouchableOpacity>
        {distance && duration ? (
          <View>
            <Text>Distance: {distance.toFixed(2)}</Text>
            <Text>Duration: {Math.ceil(duration)} min</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  searchContainer: {
    position: 'absolute',
    width: '90%',
    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
    padding: 8,
    borderRadius: 8,
    top: 10,
  },
  input: {
    borderColor: '#888',
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#bbb',
    paddingVertical: 12,
    marginTop: 16,
    borderRadius: 4,
  },
  buttonText: {
    textAlign: 'center',
  },
});
