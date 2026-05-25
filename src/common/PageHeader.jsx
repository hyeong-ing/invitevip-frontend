import { useNavigate } from "react-router-dom";
import { Home, LogOut } from "lucide-react";
import keycloak from "../keycloak.js";
import { useAuth } from "../auth/useAuth.js";
import { getAdminRoleLabel, getCustomerPermissionText } from "../auth/authDisplay.js";
import "./PageHeader.css";
export default function PageHeader() {
    const navigate = useNavigate();
    const auth = useAuth();

    const username =
        auth.username ||
        keycloak.tokenParsed?.preferred_username ||
        keycloak.tokenParsed?.name ||
        "admin";
    const roleLabel = getAdminRoleLabel(auth);
    const permissionText = getCustomerPermissionText(auth);

    const handleLogout = () => {
        keycloak.logout({
            redirectUri: `${window.location.origin}/`,
        });
    };

    return (
        <div className="page-header">
            <div className="page-header-left">
                <button
                    type="button"
                    className="page-header-brand"
                    onClick={() => navigate("/")}
                >
                    관리자 ID_
                </button>

                <span className="page-header-user">{username}</span>
                {!auth.loading && (
                    <>
                        <span className="page-header-role">{roleLabel}</span>
                        <span className="page-header-permissions">{permissionText}</span>
                    </>
                )}
            </div>

            <div className="page-header-actions">
                <button
                    type="button"
                    className="page-header-btn"
                    onClick={() => navigate("/")}
                >
                    <Home size={16} strokeWidth={2.4} />
                    메인
                </button>

                <button
                    type="button"
                    className="page-header-btn page-header-btn--logout"
                    onClick={handleLogout}
                >
                    <LogOut size={16} strokeWidth={2.4} />
                    로그아웃
                </button>
            </div>
        </div>
    );
}
