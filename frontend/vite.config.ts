import { fileURLToPath, URL } from 'node:url'
import { createReadStream, existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const installerFiles = [
  'install-wsl2.bat',
  'install-wsl2.ps1',
  'install-docker-wsl2.sh'
]

function installersFromRootPublic() {
  const rootPublicDir = fileURLToPath(new URL('../public', import.meta.url))

  return {
    name: 'installers-from-root-public',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const requestPath = (req.url || '').split('?')[0].replace(/^\//, '')
        if (!installerFiles.includes(requestPath)) {
          next()
          return
        }

        const filePath = path.join(rootPublicDir, requestPath)
        if (!existsSync(filePath)) {
          next()
          return
        }

        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        createReadStream(filePath).pipe(res)
      })
    },
    generateBundle(this: any) {
      for (const fileName of installerFiles) {
        const filePath = path.join(rootPublicDir, fileName)
        if (!existsSync(filePath)) continue
        this.emitFile({
          type: 'asset',
          fileName,
          source: readFileSync(filePath)
        })
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load environment variables based on mode
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      vueDevTools(),
      installersFromRootPublic(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false
        }
      }
    },
    build: {
      sourcemap: true
    },
    css: {
      devSourcemap: true
    },
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
    }
  }
})
