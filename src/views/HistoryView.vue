<template>
  <div class="history-view">
    <!-- Header -->
    <header class="sticky top-0 bg-white z-10 shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center">
          <RouterLink to="/" class="text-gray-600 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </RouterLink>
          <h1 class="text-xl font-semibold text-gray-900">Transaction History</h1>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="container mx-auto px-4 py-6">
      <!-- Loading state -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <svg class="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      
      <!-- Empty state -->
      <div v-else-if="!hasTransactions" class="flex flex-col items-center justify-center py-12">
        <div class="bg-gray-100 rounded-full p-4 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 class="text-xl font-medium text-gray-700 mb-2">No transactions yet</h3>
        <p class="text-gray-500 text-center mb-4">
          Once you add transactions, they will appear here
        </p>
        <RouterLink 
          to="/add" 
          class="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Add First Transaction
        </RouterLink>
      </div>
      
      <!-- Transactions by date -->
      <div v-else class="transactions-by-date">
        <div v-for="(transactions, date) in transactionsByDate" :key="date" class="mb-8">
          <h2 class="text-sm font-medium text-gray-500 mb-3 sticky top-16 bg-gray-50 py-2 px-3 rounded-md shadow-sm">
            {{ formatDateHeader(date) }}
          </h2>
          
          <div class="transaction-group space-y-3">
            <TransactionItem 
              v-for="transaction in transactions" 
              :key="transaction.id" 
              :transaction="transaction" 
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useTransactionStore } from '../stores/transactionStore';
import TransactionItem from '../components/TransactionItem.vue';

// Store
const transactionStore = useTransactionStore();

// Computed
const isLoading = computed(() => transactionStore.isLoading);
const hasTransactions = computed(() => Object.keys(transactionStore.getTransactionsByDate).length > 0);
const transactionsByDate = computed(() => transactionStore.getTransactionsByDate);

// Format date header
const formatDateHeader = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (dateStr === today.toLocaleDateString()) {
    return 'Today';
  } else if (dateStr === yesterday.toLocaleDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};

// Lifecycle
onMounted(async () => {
  if (transactionStore.transactions.length === 0) {
    await transactionStore.fetchInitialData();
  }
});
</script>