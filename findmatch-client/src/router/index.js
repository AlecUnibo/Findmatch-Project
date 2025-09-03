import { createRouter, createWebHistory } from 'vue-router'

// Helper: adatta la chiave del token se diversa
function isAuthenticated() {
  return !!localStorage.getItem('token')
}

const routes = [
  // Landing (pagina iniziale)
  {
    path: '/',
    alias: ['/welcome', '/Welcome'], // così /welcome e /Welcome funzionano
    name: 'Welcome',
    component: () => import('../views/WelcomePage.vue'),
    meta: { transition: 'page-fade', hideNav: true, allowAuthed: true }
    // allowAuthed: true => NON reindirizza gli utenti loggati
  },

  // Auth
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginPage.vue'),
    meta: { transition: 'page-fade', hideNav: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterPage.vue'),
    meta: { transition: 'page-fade', hideNav: true }
  },

  // App (protette)
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/HomePage.vue'),
    meta: { transition: 'page-fade', requiresAuth: true }
  },
  {
    path: '/partite',
    name: 'PartiteList',
    component: () => import('../views/PartiteList.vue'),
    meta: { transition: 'page-slide-fade', requiresAuth: true } // slide
  },
  {
    path: '/crea',
    name: 'CreaPartita',
    component: () => import('../views/CreaPartita.vue'),
    meta: { transition: 'page-scale-fade', requiresAuth: true } // zoom
  },
  {
    path: '/classifica',
    name: 'Classifica',
    component: () => import('../views/Classifica.vue'),
    meta: { transition: 'page-slide-fade', requiresAuth: true }
  },
  {
    path: '/profilo',
    name: 'Profilo',
    component: () => import('../views/Profilo.vue'),
    meta: { transition: 'page-fade', requiresAuth: true }
  },
  {
    path: '/impostazioni',
    name: 'Impostazioni',
    component: () => import('../views/Impostazioni.vue'),
    meta: { transition: 'page-slide-fade', requiresAuth: true }
  },
  {
    path: '/notifiche',
    name: 'Notifiche',
    component: () => import('../views/Notifiche.vue'),
    meta: { transition: 'page-fade', requiresAuth: true }
  },

  // Catch-all
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Torna in cima quando cambi schermata (mantiene posizione col back/forward)
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

// Navigation guard
router.beforeEach((to, _from, next) => {
  const authed = isAuthenticated()

  // Blocca l’accesso alle rotte protette se non autenticato
  if (to.meta.requiresAuth && !authed) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // Se sei autenticato, impedisci l’accesso SOLO a login/register.
  // La landing è visitabile anche da utenti loggati (allowAuthed: true).
  if (authed && (to.name === 'Login' || to.name === 'Register')) {
    next({ name: 'Home' })
    return
  }

  next()
})

export default router
