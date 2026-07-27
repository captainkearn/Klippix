import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { localNetworkOnly } from "./build/local-network";

export default defineConfig({
  plugins: [localNetworkOnly(), react()],
  server: {
    host: "0.0.0.0",
    port: 8020,
    strictPort: true,
    allowedHosts: [".local"]
  },
  preview: {
    host: "0.0.0.0",
    port: 8020,
    strictPort: true,
    allowedHosts: [".local"]
  }
});
