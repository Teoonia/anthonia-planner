import { defineConfig } from "vite";
// BASE is set when building for GitHub Pages (https://teoonia.github.io/anthonia-planner/)
export default defineConfig({ base: process.env.BASE || "/", build: { chunkSizeWarningLimit: 1200 } });
