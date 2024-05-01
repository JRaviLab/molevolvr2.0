import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        /** https://github.com/gregberge/svgr/discussions/770 */
        expandProps: "start",
        svgProps: {
          className: `{props.className ? props.className + " icon" : "icon"}`,
          "aria-hidden": "true",
        },
      },
    }),
  ],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
