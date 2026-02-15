import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, // <--- ESTA LÍNEA ES LA MAGIA
    //minify: 'terser', // (Opcional) Esto comprime aún más el código
  }
})