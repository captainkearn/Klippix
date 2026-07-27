import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { localNetworkOnly } from "./build/local-network";

const packageMetadata = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8")
);

export default defineConfig({
  define: {
    "import.meta.env.KLIPPIX_VERSION": JSON.stringify(packageMetadata.version)
  },
  plugins: [localNetworkOnly(), react()],
  server: {
    host: "0.0.0.0",
    port: 8020,
    strictPort: true,
    allowedHosts: [".local"],
    proxy: {
      "/terminal": {
        target: "http://127.0.0.1:8021",
        ws: true
      }
    }
  },
  preview: {
    host: "0.0.0.0",
    port: 8020,
    strictPort: true,
    allowedHosts: [".local"]
  }
});
