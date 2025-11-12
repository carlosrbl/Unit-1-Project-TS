import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        addProperty: "new-property.html",
        login: "login.html",
        profile: "profile.html",
        detail: "property-detail.html",
        register: "register.html"
      },
    },
  },
});
