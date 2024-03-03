import React, { useRef } from 'react';
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
    <ScrollView>
      <YoutubePlayer
        ref={playerRef1}
        height={315}
        play={true}
        videoId={'k9Jn0eP-ZVg'}
        onReady={onReady}
      />

      <YoutubePlayer
        ref={playerRef2}
        height={315}
        play={true}
        videoId={'-V4vEyhWDZ0'}
        onReady={onReady}
      />

      <YoutubePlayer
        ref={playerRef3}
        height={315}
        play={true}
        videoId={'Gx3_x6RH1J4'}
        onReady={onReady}
      />

      <YoutubePlayer
        ref={playerRef4}
        height={315}
        play={true}
        videoId={'Ww1DeUSC94o'}
        onReady={onReady}
      />
    </ScrollView>
  );
};

export default VideoPlayer;
