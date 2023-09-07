import { defineConfig, loadEnv, ConfigEnv, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' //这个path用到了上面安装的@types/node
import viteCompression from 'vite-plugin-compression'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  // console.log('mode', loadEnv(mode, process.cwd()).VITE_BASE_URL)
  return defineConfig({
    plugins: [
      vue(),
      {
        //  打包生产.gz 插件仅需在打包时使用
        ...viteCompression(),
        apply: 'build'
      },
      AutoImport({
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      })
    ],
    // 端口和代理配置
    server: {
      host: '0.0.0.0',
      port: 8080,
      open: true,
      https: false,
      proxy: {
        '/api': {
          target: loadEnv(mode, process.cwd()).VITE_BASE_URL,
          changeOrigin: true,
          ws: true,
          rewrite: (path: string) => path.replace(/^\/api/, '')
        }
      }
    },
    // 打包配置
    build: {
      // 打包文件名
      outDir: 'dist',
      minify: 'esbuild',
      // esbuild 打包更快，但是不能去除 console.log，terser打包慢，但能去除 console.log
      // minify: "terser",
      // terserOptions: {
      // 	compress: {
      // 		drop_console: viteEnv.VITE_DROP_CONSOLE,
      // 		drop_debugger: true
      // 	}
      // },
      // 禁用 gzip 压缩大小报告，可略微减少打包时间
      reportCompressedSize: false,
      // 规定触发警告的 chunk 大小
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          // 通过() => import()形式加载的组件会自动分包，第三方插件需手动分包
          manualChunks: {
            vue: ['vue', 'pinia', 'vue-router'],
            elementIcons: ['@element-plus/icons-vue']
          },
          // js和css文件夹分离
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]'
        }
      }
    },
    // 别名配置
    resolve: {
      alias: {
        '@': path.resolve('./src'), // @代替src
        '#': path.resolve('./types') // #代替types
      }
    },
    // 全局样式配置
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/assets/styles/index.scss";'
        }
      }
    }
  })
})
