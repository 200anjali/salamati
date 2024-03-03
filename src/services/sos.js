import Voice from '@react-native-voice/voice';

export const startVoiceListening = async (onSpeechResults) => {
  try {
    if (Voice) {
      await Voice.start('en-US');
      Voice.onSpeechResults = onSpeechResults;
    } else {
      console.error('Voice module is not available');
    }
  } catch (error) {
    console.error('Error starting voice listening:', error);
  }
};

export const stopVoiceListening = async () => {
  try {
    if (Voice) {
      await Voice.stop();
      Voice.removeAllListeners();
    }
  } catch (error) {
    console.error('Error stopping voice listening:', error);
  }
};

export const cleanupVoice = async () => {
  try {
    if (Voice) {
      Voice.removeAllListeners();
      Voice.cancel();
    }
  } catch (error) {
    console.error('Error cleaning up voice service:', error);
  }
};
