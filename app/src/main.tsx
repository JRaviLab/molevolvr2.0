import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

console.debug(import.meta);

const mock = true;

(async () => {
  /** mock network/api calls */
  if (mock || import.meta.env.MODE === "test") {
    const { setupWorker } = await import("msw/browser");
    const { handlers } = await import("../fixtures");
    await setupWorker(...handlers).start({
      serviceWorker: { url: import.meta.env.BASE_URL + "mockServiceWorker.js" },
    });
  }

  /** render app entrypoint */
  createRoot(document.getElementById("app")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
})();
