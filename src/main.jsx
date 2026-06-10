import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import keycloak from "./keycloak";
import { AuthProvider } from "./auth/AuthProvider.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 30,
            retry: 1,
        },
    },
});

keycloak
    .init({
        onLoad: "check-sso",
        checkLoginIframe: false,
        pkceMethod: "S256",
    })
    .then(() => {
        ReactDOM.createRoot(document.getElementById("root")).render(
            <StrictMode>
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        <App />
                        <ToastContainer
                            className="app-toast-container"
                            toastClassName="app-toast"
                            bodyClassName="app-toast-body"
                            closeButton={false}
                            newestOnTop
                        />
                    </AuthProvider>
                </QueryClientProvider>
            </StrictMode>
        );
    })
    .catch((error) => {
        console.error("Keycloak init 실패:", error);
    });
