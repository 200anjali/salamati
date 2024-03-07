import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  Linking,
} from "react-native";
import Voice from "@react-native-voice/voice";
import { Card, CardTitle, CardAction, CardButton } from "react-native-cards";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import Geolocation from "@react-native-community/geolocation";
import { useProps } from "../../context";

const dict = [
  "help",
  "emergency",
  "urgent",
  "help me",
  "Get away",
  "Stay back",
  "Somebody help",
  "harassed",
  "Rescue",
  "Is there anyone",
  "Please don't",
  "Call police",
  "Police",
  "Please don't"
];

const HomeScreen = ({ route, navigation }) => {
  const { propsData, updatePropsData } = useProps();
  const { userId, userName } = route.params;
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [restartInterval, setRestartInterval] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    console.log("request for location called");
    requestLocationPermission();
  }, []);

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    return () => {
      if (restartInterval) {
        clearInterval(restartInterval);
        setRestartInterval(null);
      }
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [restartInterval]);

  const requestLocationPermission = async () => {
    try {
      const permissionResult = await check(
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      );
      if (permissionResult === RESULTS.GRANTED) {
        console.log("fetching the location");
        getCurrentLocation();
      } else {
        const newPermissionResult = await request(
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        );
        if (newPermissionResult === RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          Alert.alert("Location permission denied");
        }
      }
    } catch (error) {
      console.error("Error checking location permission:", error);
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("location fetched: ", latitude, " ", longitude);
        setCurrentLocation({ latitude, longitude });
      },
      (error) => {
        console.error("Error getting current location:", error.message);
        Alert.alert("Error", "Could not get current location.");
      },
      { enableHighAccuracy: true, timeout: 20000000, maximumAge: 10000000 }
    );
  };

  const onSpeechResults = async (event) => {
    console.log("on speech results called");
    const speechText = event.value[0];
    setRecognizedText(speechText);
    const containsWordFromDict = dict.some((word) =>
      speechText.toLowerCase().includes(word.toLowerCase())
    );
    if (containsWordFromDict) {
      console.log("found emergency");
      sendNotification();
    } else {
      console.log("no words found");
    }
  };

  const startListening = async () => {
    try {
      console.log("started listening");
      setIsListening(true);
      setRecognizedText("");
      const restartIntervalId = setInterval(async () => {
        try {
          await Voice.stop();
          await Voice.start("en-US");
          console.log("restart listening interval");
        } catch (error) {
          console.error("Error restarting voice recognition:", error);
        }
      }, 5000);

      setRestartInterval(restartIntervalId);
    } catch (error) {
      console.error("Error starting voice recognition:", error);
    }
  };

  const stopListening = async () => {
    try {
      setIsListening(false);
      if (restartInterval) {
        clearInterval(restartInterval);
        setRestartInterval(null);
      }
      await Voice.stop();
    } catch (error) {
      console.error(error);
    }
  };

  const sendNotification = async () => {
    try {
      if (!currentLocation) {
        console.log("current location not found");
        await requestLocationPermission();
      } else console.log("current location found");

      console.log("location to be used: ", currentLocation);
      const latitude = currentLocation ? currentLocation.latitude : "default";
      const longitude = currentLocation ? currentLocation.longitude : "default";
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      console.log("gmaps url: ", url);
      await fetch(
        `https://b83a-38-9-60-210.ngrok-free.app/send_notification/${userId}/${userName}/${latitude}/${longitude}`,
        { method: "GET" }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Data received:", data);
          Alert.alert("Message sent successfully to your sos contacts");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const handleCardClick = (text) => {
    console.log("handle click called");
    Linking.openURL(text).catch((err) =>
      console.error("Error opening URL:", err)
    );
  };

  const callSOS = () => {
    navigation.navigate("SOSContactDetailsScreen", { userId: userId });
  };
  const callMapScreen = () => {
    navigation.navigate("SafeScreen");
  };
  const callVideoPlayer = () => {
    navigation.navigate("VideoPlayer");
  };

  console.log("home props", propsData);
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.row}>
          <Card style={styles.cardLeft}>
            <Image
              source={require("../icons/podcast.png")}
              style={styles.icon}
            />
            <CardAction separator={true} inColumn={false}>
              <CardButton
                onPress={isListening ? stopListening : startListening}
                title={isListening ? "Stop Listening" : "Start Listening"}
                color="#F33A6A"
                style={{ textAlign: "center" }}
              />
            </CardAction>
          </Card>

          <Card style={styles.cardRight}>
            <Image source={require("../icons//sos.png")} style={styles.icon} />
            <CardAction separator={true} inColumn={false}>
              <CardButton
                onPress={sendNotification}
                title="SOS Alert"
                color="#F33A6A"
                style={{ textAlign: "center" }}
              />
            </CardAction>
          </Card>
        </View>

        <View style={styles.row}>
          <Card style={styles.cardLeft}>
            <Image
              source={require("../icons/locations.png")}
              style={styles.icon}
            />
            <CardAction separator={true} inColumn={false}>
              <CardButton
                onPress={callMapScreen}
                title="Show safe path"
                color="#F33A6A"
                style={{ textAlign: "center" }}
              />
            </CardAction>
          </Card>

          <Card style={styles.cardRight}>
            <Image
              source={require("../icons/play-video.png")}
              style={styles.icon}
            />
            <CardAction separator={true} inColumn={false}>
              <CardButton
                onPress={callVideoPlayer}
                title="Defense & SpyCam Tutorial"
                color="#F33A6A"
                style={{ textAlign: "center" }}
              />
            </CardAction>
          </Card>
        </View>

        <View style={styles.row}>
          <Card style={styles.cardLeft}>
            <Image source={require("../icons/cam.png")} style={styles.icon} />
            <CardAction separator={true} inColumn={false}>
              <CardButton
                onPress={() => {
                  navigation.navigate("SpyCamScreen");
                }}
                title="Detect Spy Cam"
                color="#F33A6A"
                style={{ textAlign: "center" }}
              />
            </CardAction>
          </Card>

          <Card style={styles.cardRight}>
            <Image source={require("../icons/info.png")} style={styles.icon} />
            <CardAction separator={true} inColumn={false}>
              <CardButton
                onPress={callSOS}
                title="User Info"
                color="#F33A6A"
                style={{ textAlign: "center" }}
              />
            </CardAction>
          </Card>
        </View>

        {propsData && (
          <Card>
            <CardTitle
              title="SOS Notifications"
              style={{ color: "#F33A6A" }}
              subtitle={`Urgent SOS: ${propsData.title} urgently requests your assistance as she is in danger. Location details have been shared for immediate help.`}
            />
            <CardAction separator={true} inColumn={false}>
              <CardButton
                onPress={() => handleCardClick(propsData.body)}
                title={propsData.body ? "View location" : propsData.body}
                color="#F33A6A"
              />
            </CardAction>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#FADADD',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardLeft: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
    elevation: 3,
    borderRadius: 10,
  },
  cardRight: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
    elevation: 3,
    borderRadius: 10,
  },
  icon: {
    width: 50,
    height: 50,
  },
});

export default HomeScreen;
