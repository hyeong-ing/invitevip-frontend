import { useLocation, useNavigate } from "react-router-dom";
import { Home, LogIn } from "lucide-react";
import keycloak from "../../keycloak.js";
import "./Login.css";

export default function Login() {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const redirectPath = params.get("redirect") || "/admin/customers";

    const handleLogin = () => {
        keycloak.login({
            redirectUri: `${window.location.origin}${redirectPath}`,
        });
    };

    return (
        <div className="login-page">
            <h2 className="login-title">관리자 인증이 필요한 페이지입니다.</h2>

            <div className="login-card">
                <p style={{ marginTop: 0, marginBottom: 18, marginLeft: 35, lineHeight: 1.5 }}>
                    로그인 후 해당 페이지로 이동합니다.
                </p>

                <button className="login-btn" onClick={handleLogin}>
                    <LogIn size={18} strokeWidth={2.4} />
                    Keycloak 로그인
                </button>
            </div>

            <button className="admin-btn" onClick={() => navigate("/")}>
                <Home size={17} strokeWidth={2.4} />
                메인화면
            </button>
        </div>
    );
}
