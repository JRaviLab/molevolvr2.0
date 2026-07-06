import "@/styles.css";
import "@fontsource-variable/outfit/wght.css";
import "@fontsource-variable/jetbrains-mono";
import type { Location } from "react-router";
import {
  createBrowserRouter,
  Outlet,
  redirect,
  RouterProvider,
  useLocation,
} from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import TableOfContents from "@/components/TableOfContents";
import Toasts from "@/components/Toasts";
import ViewCorner from "@/components/ViewCorner";
import About from "@/pages/About";
import Analysis from "@/pages/Analysis";
import Home from "@/pages/Home";
import LoadAnalysis from "@/pages/LoadAnalysis";
import NewAnalysis from "@/pages/NewAnalysis";
import NotFound from "@/pages/NotFound";
import Testbed from "@/pages/Testbed";
import { scrollTo } from "@/util/dom";
import { getRedirect } from "@/util/url";
import { useEffect, useRef } from "react";
import { waitFor } from "@/util/misc";

/** app entrypoint */
export default function App() {
  return <RouterProvider router={router} />;
}

/** route layout */
function Layout() {
  /** current route */
  const location = useLocation();
  /** previous route */
  const previousLocation = useRef<Location>(null);

  /** scroll to hash */
  useEffect(() => {
    /** if page load or new page */
    if (location.pathname !== previousLocation.current?.pathname)
      (async () => {
        /** wait for page to finish loading */
        await waitFor(() => document.readyState === "complete");
        /** wait for layout shifts to stabilize */
        scrollTo(location.hash, undefined, true);
      })();
    /** if just hash changed (e.g. user clicked TOC link), scroll immediately */
    else if (location.hash !== previousLocation.current?.hash)
      scrollTo(location.hash, { behavior: "smooth", block: "start" });
    previousLocation.current = location;
  }, [location]);

  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <main>
        <TableOfContents />
        <Outlet />
      </main>
      <Footer />
      <Toasts />
      <ViewCorner />
    </QueryClientProvider>
  );
}

/** route definitions */
const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
        loader: async () => {
          /** handle 404 redirect (see 404.html) */
          const { redirectPath, redirectState } = getRedirect();
          if (redirectState !== null)
            window.history.replaceState(redirectState, "");
          if (redirectPath) {
            console.debug("Redirecting to:", redirectPath);
            console.debug("With state:", redirectState);
            return redirect(redirectPath);
          } else return null;
        },
      },
      {
        path: "new-analysis",
        element: <NewAnalysis />,
      },
      {
        path: "load-analysis",
        element: <LoadAnalysis />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "analysis/:id",
        element: <Analysis />,
      },
      {
        path: "testbed",
        element: <Testbed />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
];

/** router */
const router = createBrowserRouter(routes, {
  basename: import.meta.env.BASE_URL,
});

/** query client */
const queryClient = new QueryClient();
