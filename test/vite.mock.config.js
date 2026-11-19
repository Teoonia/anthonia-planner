import { defineConfig } from "vite";
import { fileURLToPath } from "url";
export default defineConfig({
  build: { outDir: "test/dist", chunkSizeWarningLimit: 2000 },
  resolve: { alias: [{ find: /^\.\/partner\.js$/, replacement: fileURLToPath(new URL("./mock-partner.js", import.meta.url)) }, { find: /^\.\/firebase\.js$/, replacement: fileURLToPath(new URL("./mock-firebase.js", import.meta.url)) }] }
});
