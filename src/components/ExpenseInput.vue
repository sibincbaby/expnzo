<template>
  <div class="expense-input">
    <div class="flex flex-col gap-4">
      <!-- Tab navigation for input methods -->
      <div class="flex rounded-md overflow-hidden border border-gray-200">
        <button 
          @click="activeTab = 'text'" 
          :class="[
            'flex-1 py-3 px-4 text-base font-medium', 
            activeTab === 'text' 
              ? 'bg-primary-500 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          ]"
          v-if="!initialMode || initialMode === 'text'"
        >
          <span class="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            Text Input
          </span>
        </button>
        <button 
          @click="activeTab = 'audio'" 
          :class="[
            'flex-1 py-3 px-4 text-base font-medium', 
            activeTab === 'audio' 
              ? 'bg-primary-500 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          ]"
          v-if="!initialMode || initialMode === 'audio'"
        >
          <span class="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Voice Input
          </span>
        </button>
      </div>

      <!-- Text input tab -->
      <div v-if="activeTab === 'text'" class="text-input-container">
        <div class="mb-3">
          <label for="expense-text" class="block text-sm font-medium text-gray-700 mb-1">Enter expense details</label>
          <input
            id="expense-text"
            ref="textInput"
            v-model="expenseText"
            type="text"
            placeholder="e.g. lunch 15"
            class="w-full p-4 text-lg rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            :disabled="isSubmitting"
            @keyup.enter="submitTextExpense"
          />
          <p class="text-xs text-gray-500 mt-1">
            Enter details like "item amount" (e.g. "coffee 15" or "bus fare 80")
          </p>
        </div>
        
        <button 
          @click="submitTextExpense" 
          class="w-full py-3 px-4 text-lg bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          :disabled="!expenseText.trim() || isSubmitting"
        >
          <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
          <span v-else>Add Expense</span>
        </button>
      </div>

      <!-- Audio input tab -->
      <div v-else-if="activeTab === 'audio'" class="audio-input-container">
        <div class="audio-recorder flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg bg-gray-50">
          <!-- Not supported message -->
          <p v-if="!isSupported" class="text-error-500 text-sm">
            {{ errorMessage }}
          </p>

          <!-- Recording indicator -->
          <div v-else class="recording-container flex flex-col items-center gap-4">
            <!-- Recording time -->
            <p v-if="isRecording" class="recording-time font-mono text-2xl font-semibold">
              {{ formattedTime }}
            </p>

            <!-- Audio blob preview -->
            <div v-else-if="audioBlob" class="audio-preview w-full">
              <audio ref="audioPlayer" controls class="w-full">
                <source :src="audioUrl" type="audio/webm" />
                Your browser does not support the audio element.
              </audio>
            </div>
            
            <!-- Status message -->
            <p v-if="!isRecording && !audioBlob" class="text-gray-600 text-base">
              Press the microphone button and speak your expense.
            </p>
            <p v-else-if="isRecording" class="text-primary-600 text-lg font-medium animate-pulse">
              Recording... Speak clearly.
            </p>

            <!-- Record button -->
            <div class="record-button-container mt-4">
              <button 
                v-if="!isRecording && !audioBlob"
                @click="startRecording"
                class="record-button flex items-center justify-center h-20 w-20 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-lg transition-transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary-300"
                :disabled="!isSupported"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              
              <!-- Stop button -->
              <button 
                v-else-if="isRecording"
                @click="stopRecording"
                class="record-button flex items-center justify-center h-20 w-20 rounded-full bg-error-500 hover:bg-red-600 text-white shadow-lg transition-transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-error-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              </button>
            </div>

            <!-- Action buttons when audio is recorded -->
            <div v-if="audioBlob && !isRecording" class="action-buttons flex gap-3 mt-6 w-full">
              <button 
                @click="resetRecording"
                class="flex-1 py-3 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-lg"
              >
                Reset
              </button>
              <button 
                @click="submitAudioExpense"
                class="flex-1 py-3 px-4 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
                <span v-else>Submit Audio</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, onUnmounted } from 'vue';
import { useMediaRecorder } from '../composables/useMediaRecorder';
import { useTransactionStore } from '../stores/transactionStore';

// Props
interface Props {
  initialMode?: 'text' | 'audio';
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'expense-added'): void;
}>();

// Initialize store
const transactionStore = useTransactionStore();

// Tab state
const activeTab = ref(props.initialMode || 'text');
const textInput = ref<HTMLInputElement | null>(null);

// Text input
const expenseText = ref('');
const isSubmitting = ref(false);

// Media recorder
const {
  isRecording,
  audioBlob,
  formattedTime,
  isSupported,
  errorMessage,
  startRecording,
  stopRecording,
  resetRecording
} = useMediaRecorder();

// Audio URL for playback
const audioUrl = ref('');

// Watch for audioBlob changes to create and revoke object URLs
watch(audioBlob, (newBlob, _oldBlob) => {
  // Revoke old URL to prevent memory leaks
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
  }
  
  // Create new URL if there's a blob
  if (newBlob) {
    audioUrl.value = URL.createObjectURL(newBlob);
  } else {
    audioUrl.value = '';
  }
}, { immediate: true });

// Clean up URL when component unmounts
onUnmounted(() => {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
  }
});

// Submit text expense
const submitTextExpense = async () => {
  if (!expenseText.value.trim()) return;
  
  isSubmitting.value = true;
  
  try {
    await transactionStore.addPendingTextExpense(expenseText.value);
    expenseText.value = '';
    emit('expense-added');
  } catch (error) {
    console.error('Error submitting text expense:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// Submit audio expense
const submitAudioExpense = async () => {
  if (!audioBlob.value) return;
  
  isSubmitting.value = true;
  
  try {
    await transactionStore.addPendingAudioExpense(audioBlob.value);
    resetRecording();
    emit('expense-added');
  } catch (error) {
    console.error('Error submitting audio expense:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// Watch for tab changes to focus input
const focusTextInput = async () => {
  await nextTick();
  if (activeTab.value === 'text' && textInput.value) {
    textInput.value.focus();
  }
};

// Set initial mode and focus if provided
onMounted(async () => {
  if (props.initialMode) {
    activeTab.value = props.initialMode;
  }
  await focusTextInput();
});

// Watch for tab changes
watch(activeTab, focusTextInput);
</script>