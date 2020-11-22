import { createRouter, createWebHashHistory } from 'vue-router'
import Video from '@/views/Video.vue'

const routes = [
  {
    path: '/',
    name: 'Video',
    component: Video
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
