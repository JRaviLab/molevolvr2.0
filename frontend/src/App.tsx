import "@/global/theme.css";
import "@/global/styles.css";
import "@/global/text.css";
import "@/global/layout.css";
import "@/global/effects.css";
import { useEffect } from "react";
import { IconContext } from "react-icons";
import {
  createBrowserRouter,
  Outlet,
  redirect,
  RouterProvider,
  useLocation,
  useMatches,
  useRouteLoaderData,
} from "react-router";
import { isEmpty } from "lodash";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import TableOfContents from "@/components/TableOfContents";
import ViewCorner from "@/components/ViewCorner";
import About from "@/pages/About";
import Analysis from "@/pages/Analysis";
import Home from "@/pages/Home";
import LoadAnalysis from "@/pages/LoadAnalysis";
import NewAnalysis from "@/pages/NewAnalysis";
import NotFound from "@/pages/NotFound";
import Testbed from "@/pages/Testbed";
import { scrollTo } from "@/util/dom";

/** app entrypoint */
const App = () => <RouterProvider router={router} />;

export default App;

/** route layout */
const Layout = () => {
  /** current route info */
  const { hash } = useLocation();

  /** current route id */
  const id = useMatches().at(-1)?.id || "";

  /** loader data */
  const { toc } = (useRouteLoaderData(id) as Meta) || {};

  /** scroll to hash in url */
  useEffect(() => {
    if (hash) scrollTo(hash);
  }, [hash]);

  return (
    <IconContext.Provider
      value={{ className: "icon", attr: { "aria-hidden": true } }}
    >
      <Header />
      <main>
        {toc && <TableOfContents />}
        <QueryClientProvider client={queryClient}>
          <Outlet />
        </QueryClientProvider>
      </main>
      <Footer />
      <ViewCorner />
    </IconContext.Provider>
  );
};

/** route metadata */
type Meta = { toc?: true } | undefined;

/** route definitions */
export const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
        loader: async () => {
          /** handle 404 redirect */
          const path = window.sessionStorage.redirectPath || "";
          const state = JSON.parse(window.sessionStorage.redirectState || "{}");
          if (!isEmpty(state)) window.history.replaceState(state, "");
          if (path) {
            console.debug("Redirecting to:", path);
            console.debug("With state:", state);
            window.sessionStorage.removeItem("redirectPath");
            window.sessionStorage.removeItem("redirectState");
            return redirect(path);
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
        loader: () => ({ toc: true }) satisfies Meta,
      },
      {
        path: "analysis/:id",
        element: <Analysis />,
        loader: () => ({ toc: true }) satisfies Meta,
      },
      {
        path: "testbed",
        element: <Testbed />,
        loader: () => ({ toc: true }) satisfies Meta,
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
