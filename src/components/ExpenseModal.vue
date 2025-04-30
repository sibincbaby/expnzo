<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black opacity-50" @click="close"></div>
      
      <!-- Modal -->
      <div class="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <!-- Close button -->
        <button 
          @click="close"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <span class="sr-only">Close</span>
          ×
        </button>

        <!-- Modal content -->
        <div class="mt-3">
          <ExpenseInput :initialMode="mode" @expense-added="handleExpenseAdded" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import ExpenseInput from './ExpenseInput.vue';

defineProps<{
  show: boolean;
  mode: 'text' | 'audio';
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'expense-added'): void;
}>();

const close = () => {
  emit('close');
};

const handleExpenseAdded = () => {
  emit('expense-added');
  close();
};
</script>