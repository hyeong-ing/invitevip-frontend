import { useNavigate } from "react-router-dom";
import { LogOut, Settings, Ticket, Users } from "lucide-react";
import keycloak from "../keycloak.js";
import { useAuth } from "../auth/useAuth.js";
import { getAdminRoleLabel, getCustomerPermissionText } from "../auth/authDisplay.js";
import "./MainPage.css";

export default function MainPage() {
    const navigate = useNavigate();
    const auth = useAuth();
    const username =
        auth.username ||
        keycloak.tokenParsed?.preferred_username ||
        keycloak.tokenParsed?.name ||
        "admin";
    const roleLabel = getAdminRoleLabel(auth);
    const permissionText = getCustomerPermissionText(auth);

    const handleCustomerMove = async () => {
        if (keycloak.authenticated) {
            navigate("/admin/customers");
            return;
        }

        await keycloak.login({
            redirectUri: `${window.location.origin}/admin/customers`,
        });
    };

    const handlePermissionMove = async () => {
        if (keycloak.authenticated) {
            navigate("/permission");
            return;
        }

        await keycloak.login({
            redirectUri: `${window.location.origin}/permission`,
        });
    };

    const handleLogout = async () => {
        await keycloak.logout({
            redirectUri: `${window.location.origin}/`,
        });

    };

    return (
        <div className="main-page">
            <div className="main-topbar">
                <div className="main-brand">INVITE VIP PROJECT</div>

                {keycloak.authenticated && (
                    <div className="main-topbar-actions">
                        <div className="main-user-badge">
                            <span>{username}</span>
                            {!auth.loading && (
                                <>
                                    <span className="main-user-role">{roleLabel}</span>
                                    <span className="main-user-permissions">{permissionText}</span>
                                </>
                            )}
                        </div>

                        <button
                            type="button"
                            className="main-top-btn main-top-btn--logout"
                            onClick={handleLogout}
                        >
                            <LogOut size={17} strokeWidth={2.4} />
                            로그아웃
                        </button>
                    </div>
                )}
            </div>


            <div className="main-card-grid">

                <button
                    type="button"
                    className="main-card"
                    onClick={() => navigate("/invite")}
                >
                    <Ticket className="main-card-icon" strokeWidth={1.8} />
                    <span className="main-card-label">코드 입력</span>
                </button>


                <button
                    type="button"
                    className="main-card"
                    onClick={handleCustomerMove}
                >
                    <Users className="main-card-icon" strokeWidth={1.8} />
                    <span className="main-card-label">고객 설정</span>
                </button>

                <button
                    type="button"
                    className="main-card"
                    onClick={handlePermissionMove}
                >
                    <Settings className="main-card-icon" strokeWidth={1.8} />
                    <span className="main-card-label">관리자 설정</span>
                </button>
            </div>
        </div>
    );
}
