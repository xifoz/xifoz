import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssCodeSplit: true,
    reportCompressedSize: false,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // Framer Motion — keep slim, only used in Navbar mobile menu
          if (id.includes('framer-motion')) return 'vendor-framer';

          // Lucide icons — lazy-loaded icon tree
          if (id.includes('lucide-react')) return 'vendor-lucide';

          // Recharts — only in admin dashboard
          if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';

          // All Radix UI — accordion (FAQ/public), separator, slot are small; rest are admin-only
          // Merge into single chunk to avoid circular dependency warning
          if (id.includes('@radix-ui')) return 'vendor-radix';

          // React core
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('react-router') ||
            id.includes('@remix-run')
          ) return 'vendor-core';

          // Date utilities
          if (id.includes('date-fns') || id.includes('react-day-picker')) return 'vendor-date';

          // Form utilities
          if (
            id.includes('react-hook-form') ||
            id.includes('@hookform') ||
            id.includes('zod') ||
            id.includes('class-variance-authority')
          ) return 'vendor-forms';

          // Admin data / search
          if (id.includes('cmdk') || id.includes('vaul') || id.includes('input-otp')) return 'vendor-admin-misc';

          // Sonner toasts
          if (id.includes('sonner')) return 'vendor-ui';
        },
      },
    },
  },
});
