import "@/util/seed";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { url } from "@/util/url";
import App from "./App";

const { MODE, BASE_URL } = import.meta.env;

console.debug({ env: import.meta.env });

/** whether to mock network requests with fake responses */
const mock = url.searchParams.get("mock") === "false" ? false : true;

(async () => {
  /** mock network/api calls */
  if (mock || MODE === "test") {
    const { setupWorker } = await import("msw/browser");
    const { handlers } = await import("../fixtures");
    await setupWorker(...handlers).start({
      serviceWorker: { url: BASE_URL + "mockServiceWorker.js" },
    });
  }

  /** render app entrypoint */
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
})();
