import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import VipCode from "./invitecode/VipCode.jsx";
import CustomerPage from "./customer/CustomerPage.jsx";
import Login from "./admin/adminlogin/Login.jsx";
import VIP from "./invitecode/page/VipPage.jsx";
import VVIP from "./invitecode/page/VvipPage.jsx";
import DIAMOND from "./invitecode/page/DiamondPage.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import MainPage from "./home/MainPage.jsx";
import PermissionPage from "./admin/adminsetting/PermissionPage.jsx";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/invite" element={<VipCode />} />
                <Route path="/vip" element={<VIP />} />
                <Route path="/vvip" element={<VVIP />} />
                <Route path="/diamond" element={<DIAMOND />} />
                <Route path="/login" element={<Login />} />
                <Route
                    path="/admin/customers"
                    element={
                        <ProtectedRoute>
                            <CustomerPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/permission"
                    element={
                        <ProtectedRoute requiredRole="SUPER_ADMIN">
                            <PermissionPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}