import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      enabled: true,                
      reporter: ['text', 'lcov'],      
      reportsDirectory: 'coverage',
      include: ['src/**/*.jsx'], //Que archivos cuenta el coverage -> todos los componentes, vistas
      exclude: ['**/node_modules/**', 'src/test/**'] //Que archivos excluye, codigo no se debe cubrir con pruebas

    }
  },
})
