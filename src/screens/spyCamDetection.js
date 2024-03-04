import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { magnetometer } from 'react-native-sensors';
import Sound from 'react-native-sound'; 

const MagnetometerDetection = () => {
  const [isSpyCameraDetected, setIsSpyCameraDetected] = useState(false);
  const [nmagnitude, setNmagnitude] = useState(0);
  const [threshold, setThreshold] = useState(50);

  useEffect(() => {
    const beepSound = new Sound(require('../assets/beep-05.mp3'), (error) => {
      if (error) {
        console.log("Failed to load the sound", error);
        return;
      }
    });

    const subscription = magnetometer.subscribe(({ x, y, z }) => {
      // Calculate the magnitude of the magnetic field vector
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      setNmagnitude(magnitude);
      // Threshold value to detect spy camera
      // const threshold = 50; 

      if (magnitude > threshold) {
        if (!isSpyCameraDetected) {
          setIsSpyCameraDetected(true);
          beepSound.play((success) => {
            if (!success) {
              console.log("Failed to play the sound");
            } else {
              setIsSpyCameraDetected(false); // Reset the state after playing the sound
            }
          });
        }
      } else {
        setIsSpyCameraDetected(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      beepSound.release(); // Release the sound resource
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {isSpyCameraDetected ? 'Electronic Device detected!' : 'No device detected.'}
      </Text>
      <View style={styles.meterContainer}>
        <Text>Magnitude: {nmagnitude.toFixed(2)}</Text>
        <View style={styles.meter}>
          <View style={{ ...styles.meterFill, width: `${(nmagnitude / threshold) * 100}%` }} />
        </View>
        <Text>Threshold: {threshold}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  meterContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  meter: {
    width: 200,
    height: 20,
    backgroundColor: '#ddd',
    marginTop: 10,
  },
  meterFill: {
    height: '100%',
    backgroundColor: 'blue',
  },
});

export default MagnetometerDetection;
