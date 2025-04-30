<template>
  <div 
    class="transaction-item p-4 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center gap-3"
    :class="{
      'border-l-4 border-l-success-500': transaction.type === 'credit',
      'border-l-4 border-l-error-500': transaction.type === 'debit'
    }"
  >
    <!-- Category icon -->
    <div 
      class="category-icon flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white"
      :class="getCategoryColorClass(transaction.categoryId)"
    >
      <span class="text-lg font-bold">{{ getCategoryInitial(transaction.categoryId) }}</span>
    </div>
    
    <!-- Transaction details -->
    <div class="flex-grow overflow-hidden">
      <h3 class="text-lg font-medium text-gray-900 truncate">
        {{ transaction.item }}
      </h3>
      <div class="flex items-center text-sm text-gray-500">
        <span>{{ formatDate(transaction.transactionDate) }}</span>
        <span class="mx-2">•</span>
        <span>{{ getCategoryName(transaction.categoryId) }}</span>
      </div>
    </div>
    
    <!-- Amount -->
    <div class="amount text-lg font-semibold" :class="{
      'text-success-500': transaction.type === 'credit',
      'text-error-500': transaction.type === 'debit'
    }">
      {{ transaction.type === 'credit' ? '+' : '-' }}₹{{ transaction.amount.toFixed(2) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { Transaction } from '../db';
import { useTransactionStore } from '../stores/transactionStore';

// Props
interface Props {
  transaction: Transaction;
}

defineProps<Props>();

// Store
const transactionStore = useTransactionStore();

// Format date
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric'
  });
};

// Get category name by id
const getCategoryName = (categoryId: number) => {
  const category = transactionStore.categories.find(c => c.id === categoryId);
  return category ? category.categoryName : 'Unknown';
};

// Get category initial for icon
const getCategoryInitial = (categoryId: number) => {
  const categoryName = getCategoryName(categoryId);
  return categoryName.charAt(0).toUpperCase();
};

// Get category color based on ID
const getCategoryColorClass = (categoryId: number) => {
  // Assign colors based on category ID
  const colorOptions = [
    'bg-primary-500',
    'bg-accent-500',
    'bg-secondary-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-blue-500',
    'bg-yellow-500',
    'bg-red-500'
  ];
  
  // Use modulo to cycle through colors
  const colorIndex = (categoryId - 1) % colorOptions.length;
  return colorOptions[colorIndex];
};
</script>