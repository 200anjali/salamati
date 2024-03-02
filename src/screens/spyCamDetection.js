import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { magnetometer } from 'react-native-sensors';
import Sound from 'react-native-sound'; 

const MagnetometerDetection = () => {
  const [isSpyCameraDetected, setIsSpyCameraDetected] = useState(false);

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

      // Threshold value to detect spy camera
      const threshold = 50; 

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
        {isSpyCameraDetected ? 'Spy camera detected!' : 'No spy camera detected.'}
      </Text>
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
});

export default MagnetometerDetection;
