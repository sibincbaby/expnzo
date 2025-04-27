<template>
  <div class="settings-view">
    <!-- Header -->
    <header class="sticky top-0 bg-white z-10 shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center">
          <RouterLink to="/" class="text-gray-600 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </RouterLink>
          <h1 class="text-xl font-semibold text-gray-900">Settings</h1>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="container mx-auto px-4 py-6">
      <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Application Settings</h2>
        
        <!-- PWA status -->
        <div class="mb-4 p-4 rounded-lg border border-gray-200">
          <div class="flex items-start">
            <div class="flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-gray-900">Offline Mode</h3>
              <p class="text-xs text-gray-500">
                Expenzo works offline. Changes will sync when you're back online.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Installation -->
        <div class="mb-4 p-4 rounded-lg border border-gray-200">
          <div class="flex items-start">
            <div class="flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div class="ml-3 flex-grow">
              <h3 class="text-sm font-medium text-gray-900">Install Expenzo</h3>
              <p class="text-xs text-gray-500 mb-2">
                Install the app on your device for the best experience.
              </p>
              <button 
                @click="promptInstall"
                class="text-xs py-1 px-3 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
              >
                Install App
              </button>
            </div>
          </div>
        </div>
        
        <!-- API Key -->
        <div class="mb-4 p-4 rounded-lg border border-gray-200">
          <div class="flex items-start">
            <div class="flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-gray-900">Gemini API Key</h3>
              <p class="text-xs text-gray-500 mb-2">
                <strong>SECURITY NOTICE:</strong> This is a development version. Your API key should be secured through a backend proxy before production deployment.
              </p>
              <div class="flex gap-2">
                <input 
                  type="password" 
                  v-model="apiKey"
                  placeholder="Paste your Gemini API key here" 
                  class="text-xs p-1 border border-gray-300 rounded flex-grow"
                />
                <button 
                  @click="saveApiKey"
                  class="text-xs py-1 px-3 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Debug information -->
      <div class="bg-white rounded-lg shadow-sm p-4">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Debug Information</h2>
        
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Pending Inputs:</span>
            <span class="font-medium">{{ pendingCount }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Failed Inputs:</span>
            <span class="font-medium">{{ failedCount }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Total Transactions:</span>
            <span class="font-medium">{{ transactionCount }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Categories:</span>
            <span class="font-medium">{{ categoryCount }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">App Version:</span>
            <span class="font-medium">0.1.0</span>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="mt-6 space-y-3">
          <button 
            @click="processQueue"
            class="w-full py-2 px-4 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Process Pending Queue
          </button>
          
          <button 
            @click="clearStorage"
            class="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Clear All Data
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useTransactionStore } from '../stores/transactionStore';
import db from '../db';

// Router
const router = useRouter();

// Store
const transactionStore = useTransactionStore();

// State
const apiKey = ref('');
const installPromptEvent = ref<any>(null);

// Computed
const pendingCount = computed(() => transactionStore.getPendingCount);
const failedCount = computed(() => transactionStore.getFailedCount);
const transactionCount = computed(() => transactionStore.transactions.length);
const categoryCount = computed(() => transactionStore.categories.length);

// Methods
const saveApiKey = () => {
  if (apiKey.value) {
    localStorage.setItem('geminiApiKey', apiKey.value);
    alert('API key saved successfully');
  }
};

const promptInstall = () => {
  if (!installPromptEvent.value) {
    alert('Installation is not available at the moment. Try using the "Add to Home Screen" option in your browser menu.');
    return;
  }
  
  // Show the installation prompt
  installPromptEvent.value.prompt();
  
  // Wait for the user to respond to the prompt
  installPromptEvent.value.userChoice.then((choiceResult: any) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    installPromptEvent.value = null;
  });
};

const processQueue = () => {
  transactionStore.processPendingQueue();
  alert('Processing queue started');
};

const clearStorage = async () => {
  if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
    try {
      // Delete all data from Dexie tables
      await db.pendingInputs.clear();
      await db.transactions.clear();
      
      // Keep categories, but reset to default
      await db.categories.clear();
      await db.seedDefaultCategories();
      
      // Reset store
      await transactionStore.fetchInitialData();
      
      alert('All data cleared successfully');
      
      // Navigate to home
      router.push('/');
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Failed to clear data');
    }
  }
};

// Lifecycle
onMounted(() => {
  // Check for stored API key
  const storedApiKey = localStorage.getItem('geminiApiKey');
  if (storedApiKey) {
    apiKey.value = storedApiKey;
  }
  
  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    installPromptEvent.value = e;
  });
});
</script>