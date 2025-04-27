import { ref, computed } from 'vue';

export function useMediaRecorder() {
  const isRecording = ref(false);
  const audioBlob = ref<Blob | null>(null);
  const recordingTime = ref(0);
  const mediaRecorder = ref<MediaRecorder | null>(null);
  const audioChunks = ref<Blob[]>([]);
  const recordingTimer = ref<number | null>(null);
  const isSupported = ref(true);
  const errorMessage = ref('');

  // Check if MediaRecorder is supported
  if (typeof navigator === 'undefined' || 
      typeof navigator.mediaDevices === 'undefined' || 
      typeof MediaRecorder === 'undefined') {
    isSupported.value = false;
    errorMessage.value = 'Audio recording is not supported in this browser.';
  }

  // Format recording time as mm:ss
  const formattedTime = computed(() => {
    const minutes = Math.floor(recordingTime.value / 60);
    const seconds = recordingTime.value % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  // Start recording
  const startRecording = async () => {
    if (!isSupported.value) {
      console.error(errorMessage.value);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioChunks.value = [];
      mediaRecorder.value = new MediaRecorder(stream);
      
      // Handle data available event
      mediaRecorder.value.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          audioChunks.value.push(event.data);
        }
      });
      
      // Handle stop event
      mediaRecorder.value.addEventListener('stop', () => {
        // Create blob from audio chunks
        const blob = new Blob(audioChunks.value, { type: 'audio/webm' });
        audioBlob.value = blob;
        
        // Stop all tracks from the stream
        stream.getTracks().forEach(track => track.stop());
        
        // Clear timer
        if (recordingTimer.value) {
          clearInterval(recordingTimer.value);
          recordingTimer.value = null;
        }
      });
      
      // Start recording
      mediaRecorder.value.start();
      isRecording.value = true;
      
      // Start timer
      recordingTime.value = 0;
      recordingTimer.value = window.setInterval(() => {
        recordingTime.value++;
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      errorMessage.value = 'Failed to access microphone. Please ensure you have given permission.';
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder.value && isRecording.value) {
      mediaRecorder.value.stop();
      isRecording.value = false;
    }
  };

  // Reset recording state
  const resetRecording = () => {
    audioBlob.value = null;
    recordingTime.value = 0;
    audioChunks.value = [];
    
    if (recordingTimer.value) {
      clearInterval(recordingTimer.value);
      recordingTimer.value = null;
    }
  };

  return {
    isRecording,
    audioBlob,
    formattedTime,
    isSupported,
    errorMessage,
    startRecording,
    stopRecording,
    resetRecording
  };
}