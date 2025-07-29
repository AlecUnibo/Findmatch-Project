import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'      // questo per stile
import 'bootstrap/dist/js/bootstrap.bundle.min.js' // questo per interazioni (dropdown)
import 'bootstrap/dist/js/bootstrap.bundle'


createApp(App).use(router).mount('#app')
