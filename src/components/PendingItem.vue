<template>
  <div 
    class="pending-item p-4 bg-white rounded-lg shadow-sm border border-gray-100"
    :class="{
      'border-l-4 border-l-warning-500': item.status === 'pending',
      'border-l-4 border-l-primary-500': item.status === 'processing',
      'border-l-4 border-l-error-500': item.status === 'failed'
    }"
  >
    <!-- Status icon -->
    <div class="flex items-center gap-3 mb-2">
      <div 
        class="status-icon flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
        :class="{
          'bg-warning-500': item.status === 'pending',
          'bg-primary-500 animate-pulse-slow': item.status === 'processing',
          'bg-error-500': item.status === 'failed'
        }"
      >
        <svg v-if="item.status === 'pending'" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else-if="item.status === 'processing'" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <svg v-else-if="item.status === 'failed'" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div class="flex-grow">
        <h3 class="text-md font-medium text-gray-900">
          {{ getStatusTitle }}
        </h3>
        <p class="text-xs text-gray-500">
          {{ formatTime(item.createdAt) }}
        </p>
      </div>
    </div>
    
    <!-- Input type and content preview -->
    <div class="ml-11">
      <div class="flex items-center text-sm text-gray-700 mb-1">
        <span class="font-medium mr-2">
          {{ item.inputType === 'text' ? 'Text Input:' : 'Voice Input:' }}
        </span>
        <span v-if="item.inputType === 'text' && item.rawData" class="truncate">
          {{ item.rawData }}
        </span>
        <span v-else-if="item.inputType === 'audio'" class="italic text-gray-500">
          Audio recording
        </span>
      </div>
      
      <!-- Retry information for failed items -->
      <div v-if="item.status === 'failed'" class="text-xs text-gray-500">
        Retry attempts: {{ item.retryCount }}
      </div>
      
      <!-- Actions for failed items -->
      <div v-if="item.status === 'failed'" class="mt-2 flex gap-2">
        <button 
          @click="retryItem"
          class="text-xs py-1 px-2 bg-primary-500 text-white rounded hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
        >
          Retry
        </button>
        <button 
          @click="deleteItem"
          class="text-xs py-1 px-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { PendingInput } from '../db';
import db from '../db';
import { useTransactionStore } from '../stores/transactionStore';

// Props
interface Props {
  item: PendingInput;
}

const props = defineProps<Props>();

// Store
const transactionStore = useTransactionStore();

// Format date
const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString(undefined, { 
    hour: '2-digit', 
    minute: '2-digit'
  });
};

// Get status title
const getStatusTitle = computed(() => {
  switch (props.item.status) {
    case 'pending':
      return 'Pending';
    case 'processing':
      return 'Processing';
    case 'failed':
      return 'Failed';
    default:
      return 'Unknown';
  }
});

// Retry failed item
const retryItem = async () => {
  if (props.item.status === 'failed' && props.item.id) {
    await db.pendingInputs.update(props.item.id, { 
      status: 'pending',
      retryCount: 0
    });
    
    // Update in store
    transactionStore.updatePendingInput(props.item.id, {
      status: 'pending',
      retryCount: 0
    });
    
    // Trigger processing queue
    transactionStore.processPendingQueue();
  }
};

// Delete item
const deleteItem = async () => {
  if (props.item.id) {
    await db.pendingInputs.delete(props.item.id);
    transactionStore.removePendingInput(props.item.id);
  }
};
</script>