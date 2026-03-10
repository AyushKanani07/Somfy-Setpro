import { Provider } from "react-redux";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";
import { Toaster } from "sonner";

import primeReactTreeHref from "~/styles/primeReact-tree.css?url";
import primeReactTreeSelectHref from "~/styles/primeReact-treeSelect.css?url";
import type { Route } from "./+types/root";
import "./app.css";
import Header from "./components/sharedComponent/Header";
import { store } from "./store";
import { useEffect, useState } from "react";
import { connectSocket } from "./services/socketService";
import { setSomfyPort } from "./utils/apiClients";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "stylesheet", href: primeReactTreeHref },
  { rel: "stylesheet", href: primeReactTreeSelectHref },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <Toaster richColors />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const location = useLocation().pathname;
  const showHeader = location !== "/" && location !== "/communication-log";

  useEffect(() => {
    async function init() {
      await getSomfyPort();
      connectSocket();
      setIsReady(true);
    }

    init();
  }, []);

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return (
    <Provider store={store}>
      <div className="h-screen flex flex-col overflow-hidden">
        {showHeader && <Header />}
        <Outlet />
      </div>
    </Provider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}


export async function getSomfyPort() {
  try {
    if (window.serialPort) {
      const app = await window.serialPort.getAppVersion();
      if (app) {
        if (app?.port) {
          setSomfyPort(app.port);
        }
      }
    } else {
      console.warn('Serial port API not available');
    }
  } catch (error) {
    console.error('Error getting SOMFY port:', error);
  }
}