import { createApp } from 'vue'
import App from './App.vue'

import * as ElementPlusIconsVue from '@element-plus/icons-vue' //引入图标
import 'element-plus/dist/index.css' //引入样式

import router from './router'
import store from './store'

const app = createApp(App)

app.use(store)
app.use(router)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
