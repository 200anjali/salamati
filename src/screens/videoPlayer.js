import React, { useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { ScrollView } from 'react-native';

const VideoPlayer = () => {
  const playerRef1 = useRef(null);
  const playerRef2 = useRef(null);
  const playerRef3 = useRef(null);
  const playerRef4 = useRef(null);

  const onReady = () => {
    // Pause the video immediately after it is loaded
    playerRef1.current?.pause();
    playerRef2.current?.pause();
    playerRef3.current?.pause();
    playerRef4.current?.pause();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.videoContainer}>
        <Text style={styles.videoTitle}>Empowerment through Self-Defense: Mind and Body United</Text>
        <View style={styles.videoWrapper}>
          <YoutubePlayer
            ref={playerRef1}
            height={315}
            play={true}
            videoId={'k9Jn0eP-ZVg'}
            onReady={onReady}
          />
        </View>
      </View>

      <View style={styles.videoContainer}>
        <Text style={styles.videoTitle}>Defend Your Freedom: Mastering Choke Hold Defense Techniques</Text>
        <View style={styles.videoWrapper}>
          <YoutubePlayer
            ref={playerRef2}
            height={315}
            play={true}
            videoId={'-V4vEyhWDZ0'}
            onReady={onReady}
          />
        </View>
      </View>

      <View style={styles.videoContainer}>
        <Text style={styles.videoTitle}>Unleash Your Inner Protector: Essential Self-Defense Tactics</Text>
        <View style={styles.videoWrapper}>
          <YoutubePlayer
            ref={playerRef3}
            height={315}
            play={true}
            videoId={'Gx3_x6RH1J4'}
            onReady={onReady}
          />
        </View>
      </View>

      <View style={styles.videoContainer}>
        <Text style={styles.videoTitle}>Guardian's Guide: 30 Easy Self-Defense Techniques for Empowerment</Text>
        <View style={styles.videoWrapper}>
          <YoutubePlayer
            ref={playerRef4}
            height={315}
            play={true}
            videoId={'Ww1DeUSC94o'}
            onReady={onReady}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  videoContainer: {
    marginBottom: 8,
  },
  videoWrapper: {
    marginBottom: 8,
  },
  videoTitle: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
});

export default VideoPlayer;
