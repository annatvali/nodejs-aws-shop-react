import React from "react";
import { createRoot } from "react-dom/client";
import App from "~/components/App/App";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { theme } from "~/theme";

type ErrorMessages = Record<number, string[]>;

const { fetch: originalFetch } = window;

window.fetch = async (...args) => {
  try {
    const response = await originalFetch(...args);
    if (!response.ok) {
      const errorMessages: ErrorMessages = {
        401: ["Authentication failed.", "Error 401: Authentication required."],
        403: ["Access to this resource is denied.", "Error 403: Forbidden."],
      };

      const [logMessage, alertMessage] = errorMessages[response.status] || [
        "Unexpected error occurred.",
        `Error ${response.status}: An unexpected error occurred.`,
      ];

      console.log(logMessage);
      alert(alertMessage);
    }
    return response;
  } catch (error) {
    if (error instanceof TypeError) {
      console.log(
        "A network error occurred, or the request was blocked by CORS policy."
      );
    } else {
      console.log("An error occurred while setting up the request.");
    }
    return Promise.reject(error);
  }
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: false, staleTime: Infinity },
  },
});

if (import.meta.env.DEV) {
  const { worker } = await import("./mocks/browser");
  worker.start({ onUnhandledRequest: "bypass" });
}

const container = document.getElementById("app");
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
