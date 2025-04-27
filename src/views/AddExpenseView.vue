<template>
  <div class="add-expense-view">
    <!-- Header -->
    <header class="sticky top-0 bg-white z-10 shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center">
          <RouterLink to="/" class="text-gray-600 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </RouterLink>
          <h1 class="text-xl font-semibold text-gray-900">Add Expense</h1>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="container mx-auto px-4 py-6">
      <ExpenseInput />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import ExpenseInput from '../components/ExpenseInput.vue';
</script>