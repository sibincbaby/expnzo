<template>
  <div class="home-view">
    <!-- Header -->
    <header class="sticky top-0 bg-white z-10 shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900">Expenzo</h1>
          
          <!-- Status indicators -->
          <div class="flex gap-2">
            <div 
              v-if="pendingCount > 0" 
              class="flex items-center px-2 py-1 bg-warning-500 bg-opacity-10 rounded-full"
            >
              <span class="h-2 w-2 rounded-full bg-warning-500 mr-1"></span>
              <span class="text-xs text-warning-500 font-medium">{{ pendingCount }}</span>
            </div>
            
            <RouterLink to="/settings" class="p-2 text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </RouterLink>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="container mx-auto px-4 py-4 pb-32">
      <!-- Balance card -->
      <div class="balance-card bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg shadow-lg p-6 mb-6 text-white">
        <p class="text-sm opacity-80">Total Balance</p>
        <h2 class="text-3xl font-bold">₹{{ formatAmount(totalAmount) }}</h2>
        
        <!-- Quick stats -->
        <div class="flex justify-between mt-4 text-sm">
          <div>
            <p class="opacity-80">Income</p>
            <p class="font-semibold">₹{{ formatAmount(totalIncome) }}</p>
          </div>
          <div>
            <p class="opacity-80">Expenses</p>
            <p class="font-semibold">₹{{ formatAmount(totalExpense) }}</p>
          </div>
          <div>
            <p class="opacity-80">This Month</p>
            <p class="font-semibold">₹{{ formatAmount(currentMonthTotal) }}</p>
          </div>
        </div>
      </div>
      
      <!-- Recent transactions section -->
      <section v-if="hasTransactions" class="recent-transactions mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Recent Transactions</h2>
          <RouterLink 
            to="/history" 
            class="text-primary-500 text-sm font-medium hover:text-primary-600"
          >
            View All
          </RouterLink>
        </div>
        
        <div class="transactions-list space-y-3">
          <TransactionItem 
            v-for="transaction in recentTransactions" 
            :key="transaction.id" 
            :transaction="transaction" 
          />
        </div>
      </section>
      
      <!-- Pending items -->
      <section v-if="pendingCount > 0" class="pending-items mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Pending Items</h2>
        
        <div class="pending-list space-y-3">
          <PendingItem 
            v-for="item in pendingInputs" 
            :key="item.id" 
            :item="item" 
          />
        </div>
      </section>
      
      <!-- Empty state -->
      <section v-if="!hasTransactions && !pendingCount" class="empty-state flex flex-col items-center justify-center py-8">
        <div class="bg-gray-100 rounded-full p-4 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 class="text-xl font-medium text-gray-700 mb-2">No transactions yet</h3>
        <p class="text-gray-500 text-center mb-4">
          Get started by adding your first expense using the button below
        </p>
      </section>
    </main>
    
    <!-- Add expense button -->
    <div class="fixed bottom-6 right-6">
      <RouterLink 
        to="/add" 
        class="add-button bg-primary-500 text-white rounded-full h-14 w-14 shadow-lg flex items-center justify-center hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </RouterLink>
    </div>
    
    <!-- Install prompt -->
    <InstallPrompt />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useTransactionStore } from '../stores/transactionStore';
import TransactionItem from '../components/TransactionItem.vue';
import PendingItem from '../components/PendingItem.vue';
import InstallPrompt from '../components/InstallPrompt.vue';

// Store
const transactionStore = useTransactionStore();

// Computed properties
const hasTransactions = computed(() => transactionStore.transactions.length > 0);
const pendingCount = computed(() => transactionStore.getPendingCount);
const pendingInputs = computed(() => transactionStore.pendingInputs.filter(item => 
  item.status === 'pending' || item.status === 'processing' || item.status === 'failed'
));

// Recent transactions - get last 5
const recentTransactions = computed(() => {
  return [...transactionStore.transactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
});

// Format amount helper to prevent NaN display
const formatAmount = (value: number) => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.00';
  }
  return value.toFixed(2);
};

// Calculate financials
const totalAmount = computed(() => {
  const amount = transactionStore.getTotalAmount;
  return isNaN(amount) ? 0 : amount;
});

const totalIncome = computed(() => {
  const income = transactionStore.transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  return isNaN(income) ? 0 : income;
});

const totalExpense = computed(() => {
  const expense = transactionStore.transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  return isNaN(expense) ? 0 : expense;
});

const currentMonthTotal = computed(() => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const total = transactionStore.transactions
    .filter(t => new Date(t.transactionDate) >= startOfMonth)
    .reduce((sum, t) => {
      const amount = Number(t.amount) || 0;
      return t.type === 'credit' ? sum + amount : sum - amount;
    }, 0);
  
  return isNaN(total) ? 0 : total;
});

// Lifecycle hooks
onMounted(async () => {
  await transactionStore.fetchInitialData();
  
  // Start processing queue to handle any pending inputs
  transactionStore.processPendingQueue();
});
</script>