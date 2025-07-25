import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import PartiteList from '../views/PartiteList.vue'
import PartitaDetail from '../views/PartitaDetail.vue'
import CreaPartita from '../views/CreaPartita.vue'
import Classifica from '../views/Classifica.vue'
import Profilo from '../views/Profilo.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
  { path: '/partite', component: PartiteList },
  { path: '/partita/:id', component: PartitaDetail },
  { path: '/crea', component: CreaPartita },
  { path: '/classifica', component: Classifica },
  { path: '/profilo', component: Profilo },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
