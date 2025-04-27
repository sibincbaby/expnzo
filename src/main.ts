import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { initDatabase } from './db'
import { registerSW } from 'virtual:pwa-register'

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    // Prompt user to update
    if (confirm('New content available. Reload to update?')) {
      updateSW();
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  }
});

// Initialize database before starting the app
(async () => {
  await initDatabase();
  
  const app = createApp(App);
  const pinia = createPinia();
  
  app.use(pinia);
  app.use(router);
  app.mount('#app');
})();