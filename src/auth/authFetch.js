import keycloak from "../keycloak.js";

export const AUTH_TOKEN_REFRESH_FAILED_EVENT = "auth-token-refresh-failed";

function notifyTokenRefreshFailed() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(AUTH_TOKEN_REFRESH_FAILED_EVENT));
    }
}

export async function authFetch(url, options = {}) {
    if (!keycloak.authenticated) {
        throw new Error("로그인이 필요합니다.");
    }

    try {
        await keycloak.updateToken(30);
    } catch (error) {
        console.error("토큰 갱신 실패:", error);
        keycloak.clearToken();
        notifyTokenRefreshFailed();
        throw new Error("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
    }

    const headers = new Headers(options.headers || {});

    if (keycloak.token) {
        headers.set("Authorization", `Bearer ${keycloak.token}`);
    }

    return fetch(url, {
        ...options,
        headers,
    });
}
