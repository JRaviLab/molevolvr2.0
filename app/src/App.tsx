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
} from "react-router-dom";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FloatButtons from "@/components/FloatButtons";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import TableOfContents from "@/components/TableOfContents";
import Toasts from "@/components/Toasts";
import About from "@/pages/About";
import Analysis from "@/pages/Analysis";
import Home from "@/pages/Home";
import LoadAnalysis from "@/pages/LoadAnalysis";
import NewAnalysis from "@/pages/NewAnalysis";
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
    if (!hash) return;
    scrollTo(hash);
  }, [hash]);

  return (
    <IconContext.Provider
      value={{ className: "icon", attr: { "aria-hidden": true } }}
    >
      <Header />
      <main>
        {toc && <TableOfContents />}
        <QueryParamProvider
          adapter={ReactRouter6Adapter}
          options={{ updateType: "replaceIn" }}
        >
          <QueryClientProvider client={queryClient}>
            <Outlet />
          </QueryClientProvider>
        </QueryParamProvider>
      </main>
      <Footer />
      <Toasts />
      <FloatButtons />
    </IconContext.Provider>
  );
};

/** route metadata */
type Meta = { toc?: true } | undefined;

/** route definitions */
const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
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
        /** not found */
        path: "*",
        loader: async () => {
          /** handle 404 redirect */
          const url = window.sessionStorage.redirect as string;
          if (url) {
            console.info("Redirecting to:", url);
            window.sessionStorage.removeItem("redirect");
            return redirect(url);
          } else return redirect("/");
        },
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
