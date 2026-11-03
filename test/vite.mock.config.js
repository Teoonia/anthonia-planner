import { defineConfig } from "vite";
import { fileURLToPath } from "url";
export default defineConfig({
  build: { outDir: "test/dist", chunkSizeWarningLimit: 2000 },
  resolve: { alias: [{ find: /^\.\/firebase\.js$/, replacement: fileURLToPath(new URL("./mock-firebase.js", import.meta.url)) }] }
});
