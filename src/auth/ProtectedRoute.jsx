import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth.js";

export default function ProtectedRoute({ children, requiredRole }) {
    const location = useLocation();
    const auth = useAuth();

    if (auth.loading) {
        return (
            <div style={{ padding: 24, textAlign: "center" }}>
                권한 확인 중입니다.
            </div>
        );
    }

    if (!auth.isAuthenticated) {
        const redirect = encodeURIComponent(location.pathname);
        return <Navigate to={`/login?redirect=${redirect}`} replace />;
    }

    if (requiredRole === "SUPER_ADMIN" && !auth.superAdmin) {
        return <Navigate to="/" replace />;
    }
    return children;
}
