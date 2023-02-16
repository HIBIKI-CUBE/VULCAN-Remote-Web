import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  server: {
    https: false,
  },
  plugins: [mkcert(), sveltekit()],
});
