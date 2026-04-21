// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import tailwindcss from "@tailwindcss/vite";

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [tailwindcss(), react()],
//   server: {
//     proxy: {
//       "/api": {
//         target: "https://crmapi.starwaywebdigital.com",
//         changeOrigin: true,
//         secure: false,
//       },
//     },
//   },
// });

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), react()],

  base: "/", // important for Hostinger root domain deploy

  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: "https://crmapi.starwaywebdigital.com/ ",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
