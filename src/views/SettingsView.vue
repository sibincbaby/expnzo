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
        
        <!-- Model Name - NEW SECTION -->
        <div class="mb-4 p-4 rounded-lg border border-gray-200">
          <div class="flex items-start">
            <div class="flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-gray-900">Gemini Model Name</h3>
              <p class="text-xs text-gray-500 mb-2">
                Customize the Gemini model used for processing. Leave blank to use the default model.
              </p>
              <div class="flex gap-2">
                <input 
                  type="text" 
                  v-model="modelName"
                  placeholder="e.g., gemini-1.5-flash-latest" 
                  class="text-xs p-1 border border-gray-300 rounded flex-grow"
                />
                <button 
                  @click="saveModelName"
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

      <!-- Export data section -->
      <div class="mt-6 bg-white rounded-lg shadow-sm p-4">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Data Management</h2>
        
        <div class="space-y-3">
          <button 
            @click="exportTransactions('csv')"
            class="w-full py-2 px-4 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
          >
            Export as CSV
          </button>

          <button 
            @click="exportTransactions('json')"
            class="w-full py-2 px-4 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
          >
            Export as JSON
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
const modelName = ref('');
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

// New method to save model name
const saveModelName = () => {
  // Save to localStorage
  localStorage.setItem('geminiModelName', modelName.value);
  
  // Update the store to use the new model name
  transactionStore.$patch({ modelName: modelName.value || 'gemini-1.5-flash-latest' });
  
  alert('Model name saved successfully');
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

// Export transactions as CSV or JSON
const exportTransactions = async (format: 'csv' | 'json') => {
  try {
    // Get all transactions
    const transactions = transactionStore.transactions;
    
    if (transactions.length === 0) {
      alert('No transactions to export');
      return;
    }
    
    // Get categories for reference
    const categories = transactionStore.categories;
    
    // Format the data
    let content = '';
    let filename = '';
    let dataType = '';
    
    if (format === 'csv') {
      // Create CSV content
      const headers = ['Date', 'Item', 'Amount', 'Category', 'Type'];
      const csvRows = [headers.join(',')];
      
      transactions.forEach(transaction => {
        const category = categories.find(c => c.id === transaction.categoryId);
        const categoryName = category ? category.categoryName : 'Unknown';
        const date = new Date(transaction.transactionDate).toLocaleDateString();
        const type = transaction.type === 'debit' ? 'Expense' : 'Income';
        
        const row = [
          `"${date}"`,
          `"${transaction.item}"`,
          transaction.amount,
          `"${categoryName}"`,
          `"${type}"`
        ].join(',');
        
        csvRows.push(row);
      });
      
      content = csvRows.join('\n');
      filename = `expenzo_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
      dataType = 'text/csv';
    } else {
      // Create JSON content with additional category information
      const exportData = transactions.map(transaction => {
        const category = categories.find(c => c.id === transaction.categoryId);
        
        return {
          ...transaction,
          categoryName: category ? category.categoryName : 'Unknown',
          formattedDate: new Date(transaction.transactionDate).toLocaleDateString(),
        };
      });
      
      content = JSON.stringify(exportData, null, 2);
      filename = `expenzo_transactions_${new Date().toISOString().slice(0, 10)}.json`;
      dataType = 'application/json';
    }
    
    // Create a download link
    const blob = new Blob([content], { type: dataType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set link attributes
    link.href = url;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting transactions:', error);
    alert('Failed to export transactions');
  }
};

// Lifecycle
onMounted(() => {
  // Check for stored API key
  const storedApiKey = localStorage.getItem('geminiApiKey');
  if (storedApiKey) {
    apiKey.value = storedApiKey;
  }
  
  // Check for stored model name
  const storedModelName = localStorage.getItem('geminiModelName');
  if (storedModelName) {
    modelName.value = storedModelName;
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