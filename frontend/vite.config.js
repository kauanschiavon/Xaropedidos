import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // ou o plugin do seu framework

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: ['..'] // Permite acessar arquivos um nível acima da pasta frontend
    }
  }
})
