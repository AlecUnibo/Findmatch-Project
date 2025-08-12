import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import PartiteList from '../views/PartiteList.vue'
import CreaPartita from '../views/CreaPartita.vue'
import Classifica from '../views/Classifica.vue'
import Profilo from '../views/Profilo.vue'
import Impostazioni from '../views/Impostazioni.vue'
import Notifiche from '../views/Notifiche.vue'

const routes = [
  { path: '/', component: LoginPage },
  { path: '/home', component: HomePage },
  { path: '/register', component: RegisterPage },
  { path: '/partite', component: PartiteList },
  { path: '/crea', component: CreaPartita },
  { path: '/classifica', component: Classifica },
  { path: '/profilo', component: Profilo },
  { path: '/impostazioni', component: Impostazioni },
  { path: '/notifiche', component: Notifiche },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
