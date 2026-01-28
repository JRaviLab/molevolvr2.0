import "@/styles.css";
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource-variable/jetbrains-mono";
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
import { getDocBbox, glow, scrollTo } from "@/util/dom";
import { useChanged } from "@/util/hooks";
import { waitFor, waitForStable } from "@/util/misc";
import { redirectPath, redirectState } from "@/util/url";

/** app entrypoint */
const App = () => <RouterProvider router={router} />;

export default App;

/** route layout */
const Layout = () => {
  /** current route info */
  const { hash, pathname, search } = useLocation();

  /** did any key part of url change */
  const changed = useChanged({ pathname, search, hash });
  /** did hash change */
  const hashChanged = useChanged(hash);

  /** if just hash changed, scroll immediately. else, wait for layout shifts */
  if (changed) scrollToHash(hash, hashChanged);

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
};

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
          /** handle 404 redirect */
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

/** scroll to target of url hash on page */
const scrollToHash = async (hash: string, waitForLayoutShift = true) => {
  if (!hash) return;

  /** wait for element to appear */
  const element = await waitFor(() => document.querySelector(hash));
  if (!element) return;

  /** wait for layout shifts to stabilize */
  if (waitForLayoutShift) await waitForStable(() => getDocBbox(element).top);

  scrollTo(element);
  glow(element);
};
