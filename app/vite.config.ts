import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/molevolvr2.0/" : "/",
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        /** https://github.com/gregberge/svgr/discussions/770 */
        expandProps: "start",
        svgProps: {
          className: `{props.className ? props.className + " icon" : "icon"}`,
        },
      },
    }),
  ],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
