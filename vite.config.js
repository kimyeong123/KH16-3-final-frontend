import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  define: {
    global: "window", // global이라는 키워드가 window를 가리키도록 별칭 설정
  },
});
