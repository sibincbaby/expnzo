import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import AddExpenseView from '../views/AddExpenseView.vue';
import HistoryView from '../views/HistoryView.vue';
import SettingsView from '../views/SettingsView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'Expenzo - Home' }
    },
    {
      path: '/add',
      name: 'add-expense',
      component: AddExpenseView,
      meta: { title: 'Add Expense' }
    },
    {
      path: '/history',
      name: 'history',
      component: HistoryView,
      meta: { title: 'Transaction History' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { title: 'Settings' }
    }
  ]
});

// Update page title based on route
router.beforeEach((to, from, next) => {
  document.title = to.meta.title?.toString() || 'Expenzo';
  next();
});

export default router;