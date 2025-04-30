<template>
  <div v-if="error" class="error-boundary p-4 bg-red-100 border border-red-300 rounded-md">
    <h3 class="text-lg text-red-800 font-medium mb-2">Oops! Something went wrong</h3>
    <p class="text-sm text-red-700 mb-4">{{ errorMessage }}</p>
    <button 
      class="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      @click="resetError"
    >
      Try Again
    </button>
  </div>
  <slot v-else></slot>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';

const error = ref<Error | null>(null);
const errorMessage = ref('');

// Capture errors from child components
onErrorCaptured((err: unknown, instance, info) => {
  error.value = err instanceof Error ? err : new Error(String(err));
  errorMessage.value = error.value.message || 'An unexpected error occurred';
  console.error('Error captured by boundary:', err, info);
  
  // Prevent error from propagating further
  return false;
});

// Reset error state
const resetError = () => {
  error.value = null;
  errorMessage.value = '';
};

// Expose to parent component
defineExpose({
  resetError
});
</script>