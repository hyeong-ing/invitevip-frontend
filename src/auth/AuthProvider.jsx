import { useCallback, useEffect, useMemo, useState } from "react";
import keycloak from "../keycloak.js";
import {authFetch} from "./authFetch.js";
import { AuthContext } from "./AuthContext.js";

const EMPTY_AUTH = {
    loading: false,
    isAuthenticated: false,
    username: "",
    authorities: [],
    superAdmin: false,
    customerRead: false,
    customerSearch: false,
    customerAdd: false,
    customerEdit: false,
    customerDelete: false,
};

export function AuthProvider({ children }) {
    const [authState, setAuthState] = useState(() => ({
        ...EMPTY_AUTH,
        loading: !!keycloak.authenticated,
        isAuthenticated: !!keycloak.authenticated,
    }));

    const loadMe = useCallback(async () => {
        if (!keycloak.authenticated) {
            setAuthState(EMPTY_AUTH);
            return;
        }

        setAuthState((prev) => ({
            ...prev,
            loading: true,
            isAuthenticated: true,
        }));

        try {
            const response = await authFetch("/api/auth/me");

            if (!response.ok) {
                throw new Error("권한 정보를 불러오지 못했습니다.");
            }

            const data = await response.json();

            setAuthState({
                loading: false,
                isAuthenticated: true,
                username: data.username ?? "",
                authorities: data.authorities ?? [],
                superAdmin: !!data.superAdmin,
                customerRead: !!data.customerRead,
                customerSearch: !!data.customerSearch,
                customerAdd: !!data.customerAdd,
                customerEdit: !!data.customerEdit,
                customerDelete: !!data.customerDelete,
            });
        } catch (error) {
            console.error(error);
            setAuthState((prev) => ({
                ...prev,
                loading: false,
            }));
        }
    }, []);

    useEffect(() => {
        loadMe();
    }, [loadMe]);

    const value = useMemo(
        () => ({
            ...authState,
            reloadAuth: loadMe,
        }),
        [authState, loadMe]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
