<template>
  <div v-if="showInstallPrompt" class="install-prompt fixed bottom-0 left-0 right-0 p-4 bg-white shadow-lg border-t border-gray-200 z-50">
    <div class="container mx-auto flex items-center justify-between">
      <div>
        <h3 class="text-lg font-medium text-gray-900">Install Expenzo</h3>
        <p class="text-sm text-gray-600">Add to your home screen for quick access and offline use</p>
      </div>
      <div class="flex gap-3">
        <button 
          @click="dismissPrompt" 
          class="py-2 px-4 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          Not Now
        </button>
        <button 
          @click="installApp" 
          class="py-2 px-4 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Install
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// State
const deferredPrompt = ref<any>(null);
const showInstallPrompt = ref(false);

// Check if user has already dismissed the prompt
const hasUserDismissedPrompt = () => {
  return localStorage.getItem('installPromptDismissed') === 'true';
};

// Set prompt as dismissed
const setPromptAsDismissed = () => {
  localStorage.setItem('installPromptDismissed', 'true');
  
  // Reset after 2 weeks
  const twoWeeks = 14 * 24 * 60 * 60 * 1000;
  setTimeout(() => {
    localStorage.removeItem('installPromptDismissed');
  }, twoWeeks);
};

// Dismiss prompt
const dismissPrompt = () => {
  showInstallPrompt.value = false;
  setPromptAsDismissed();
};

// Install app
const installApp = async () => {
  if (!deferredPrompt.value) return;
  
  // Show the install prompt
  deferredPrompt.value.prompt();
  
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.value.userChoice;
  
  // Hide the prompt regardless of outcome
  showInstallPrompt.value = false;
  
  if (outcome === 'accepted') {
    console.log('User accepted the install prompt');
  } else {
    console.log('User dismissed the install prompt');
    setPromptAsDismissed();
  }
  
  // Clear the deferredPrompt for next time
  deferredPrompt.value = null;
};

// Listen for beforeinstallprompt event
const beforeInstallPromptHandler = (e: Event) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  
  // Stash the event so it can be triggered later
  deferredPrompt.value = e;
  
  // Check if user has already dismissed
  if (!hasUserDismissedPrompt()) {
    // Show our custom install prompt
    showInstallPrompt.value = true;
  }
};

// Listen for appinstalled event
const appInstalledHandler = () => {
  // App is installed, hide the prompt
  showInstallPrompt.value = false;
  console.log('PWA was installed');
};

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);
  window.addEventListener('appinstalled', appInstalledHandler);
});

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
  window.removeEventListener('appinstalled', appInstalledHandler);
});
</script>