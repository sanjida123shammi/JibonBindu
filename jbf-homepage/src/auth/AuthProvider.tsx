import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "../api/authApi";
import { tokenStore } from "../api/http";
import type { UserSession } from "../types";
import { AuthContext } from "./AuthContext";

// Decodes the JWT claims synchronously so user session is recognized immediately
function parseJwt(token: string | null): UserSession | null {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    const payload = JSON.parse(jsonPayload);
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }
    return {
      id:
        payload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] ||
        payload["nameid"] ||
        payload["sub"] ||
        null,
      name:
        payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
        payload["unique_name"] ||
        payload["name"] ||
        "User",
      email:
        payload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ] ||
        payload["email"] ||
        null,
      role:
        payload[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] ||
        payload["role"] ||
        "User",
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Synchronous initialization: reads from URL ?token=... or saved localStorage token
  const [user, setUser] = useState<UserSession | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get("token");
      if (tokenFromUrl) {
        tokenStore.set(tokenFromUrl);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
        return parseJwt(tokenFromUrl);
      }
    }
    return parseJwt(tokenStore.get());
  });

  const [loading, setLoading] = useState<boolean>(
    () => tokenStore.get() !== null && !user,
  );

  useEffect(() => {
    const currentToken = tokenStore.get();
    if (!currentToken) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    authApi
      .me()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        const parsed = parseJwt(currentToken);
        if (!parsed) {
          tokenStore.clear();
          if (!cancelled) setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    if (!res.flag) throw new Error(res.message);

    tokenStore.set(res.token);
    const parsed = parseJwt(res.token);
    if (parsed) setUser(parsed);

    try {
      setUser(await authApi.me());
    } catch {
      // keep parsed JWT session if /me is unreachable
    }
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
