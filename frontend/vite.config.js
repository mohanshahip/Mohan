import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  esbuild: {
    drop: ["console", "debugger"], // Remove console and debugger in production
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@context": path.resolve(__dirname, "./src/context"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@styles": path.resolve(__dirname, "./src/styles"),
    },
  },

  // ✅ API proxy (VERY IMPORTANT)
  server: {
    host: "localhost",
    port: 5173,
    strictPort: false,
    cors: true, // Enable CORS for dev server
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 5173,
      overlay: true, // Show HMR errors in the browser overlay
    },
    proxy: {
      "/api": {
        target: "http://localhost:5012", // your backend port
        changeOrigin: true,
        secure: false,
        ws: true, // Enable proxying for WebSockets
      },
      "/uploads": {
        target: "http://localhost:5012", // your backend port
        changeOrigin: true,
        secure: false,
      },
    },
    // Prevent some pre-bundling issues
    watch: {
      usePolling: true, // Useful for some environments
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["lucide-react", "recharts", "@fortawesome/fontawesome-free"],
          i18n: ["i18next", "react-i18next"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    minify: "esbuild", // Using esbuild as it's faster and built-in
  },
});
