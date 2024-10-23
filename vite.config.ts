import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from "path";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  base: "/realtimeChat/",
  resolve: {
    alias: {
      $lib: path.resolve("./src/lib"),
    },
  },
})
