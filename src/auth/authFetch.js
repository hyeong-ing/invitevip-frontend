import keycloak from "../keycloak.js";

export async function authFetch(url, options = {}) {
    if (!keycloak.authenticated) {
        throw new Error("로그인이 필요합니다.");
    }

    await keycloak.updateToken(30);

    const headers = new Headers(options.headers || {});

    if (keycloak.token) {
        headers.set("Authorization", `Bearer ${keycloak.token}`);
    }

    return fetch(url, {
        ...options,
        headers,
    });
}
